import dotenv from "dotenv";
import postgres from "postgres";
import { createPosterClient, PosterError } from "../lib/poster/client";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });
async function main() {
  const { settings, products } = await createPosterClient().inspect();
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false, connect_timeout: 10 });
  try {
    const local = await sql.begin("read only", async tx => {
      await tx`SET LOCAL statement_timeout = '8s'`;
      const cards = await tx`SELECT p.slug,p.type,p.sku,p.name,p.price_display,p.price_amount,p.price_currency,t.name AS ru_name,t.size FROM products p LEFT JOIN product_translations t ON t.product_id=p.id AND t.locale='ru' WHERE p.is_published ORDER BY p.type,p.slug`;
      const variants = await tx`SELECT p.slug,p.name,p.attributes,p.volume_options,v.id,v.sku,v.color_label,v.retail_price,v.currency,v.availability FROM accessory_products p JOIN accessory_variants v ON v.product_id=p.id WHERE p.editorial_state='published' AND v.is_active ORDER BY p.slug,v.sort_order`;
      return { cards, variants };
    });
    const poster = products.map(p => {
      const spot = Array.isArray(p.spots) ? p.spots.find(s => String(s.spot_id) === "1") : null;
      return { id: p.product_id, name: p.product_name, category: p.category_name, sku: p.product_code, type: p.type,
        price: spot && spot.price != null ? Number(spot.price)/100 : null, visible: spot?.visible ?? null,
        groups: Array.isArray(p.group_modifications) ? p.group_modifications.map(g => ({ id: g.dish_modification_group_id, name: g.name, min: g.num_min, max: g.num_max, deleted: g.is_deleted,
          options: Array.isArray(g.modifications) ? g.modifications.map((m: Record<string, unknown>) => ({ id: m.dish_modification_id, name: m.name, price: m.price })) : [] })) : [],
        modifications: Array.isArray(p.modifications) ? p.modifications.map(m => ({ id: m.modificator_id, name: m.modificator_name, sku: m.modificator_product_code, spots: m.spots })) : [],
      };
    });
    console.log(JSON.stringify({settings,local,poster}));
  } finally { await sql.end({ timeout: 5 }); }
}
main().catch(error => { console.error(error instanceof PosterError ? error.message : "Catalog audit failed; sensitive details omitted"); process.exitCode = 1; });

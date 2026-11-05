import dotenv from "dotenv";
import { createPosterClient, PosterError } from "../lib/poster/client";
import { posterOrderDestination } from "../lib/poster/routing";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });

async function main() {
  const { settings, spots, categories, products, groups } = await createPosterClient().inspect();
  if (settings.account !== posterOrderDestination.account || !spots.some(s => String(s.spot_id) === posterOrderDestination.spotId)) {
    throw new PosterError("account");
  }
  // Only the integration inventory is shown. No token, customer list, addresses or contacts.
  console.log(JSON.stringify({
    ...settings,
    plannedOrderDestination: posterOrderDestination,
    productCount: products.length,
    productsWithSku: products.filter(p => typeof p.product_code === "string" && p.product_code.trim()).length,
    productsWithDishModifiers: products.filter(p => Array.isArray(p.group_modifications) && p.group_modifications.length).length,
    spots: spots.map(s => ({ id: s.spot_id, name: s.spot_name, storages: Array.isArray(s.storages) ? s.storages.map(v => ({ id: v.storage_id, name: v.storage_name })) : [] })),
    categories: categories.map(c => ({ id: c.category_id, name: c.category_name })),
    groups: groups.map(g => ({ id: g.client_groups_id, name: g.client_groups_name, type: g.loyalty_type, percentage: g.client_groups_discount, deleted: g.delete })),
    products: (process.argv.includes("--products") ? products : []).map(p => ({ id: p.product_id, name: p.product_name, sku: p.product_code, category: p.category_name, type: p.type,
      spots: Array.isArray(p.spots) ? p.spots.map(s => ({ id: s.spot_id, priceMinor: s.price, visible: s.visible })) : [],
      modifications: Array.isArray(p.modifications) ? p.modifications.map(m => ({ id: m.modificator_id, name: m.modificator_name, sku: m.modificator_product_code })) : [],
      hasDishModifiers: Array.isArray(p.group_modifications) && p.group_modifications.length > 0,
      dishModifiers: Array.isArray(p.group_modifications) ? p.group_modifications.map(g => ({ id: g.dish_modification_group_id, name: g.name, min: g.num_min, max: g.num_max, options: Array.isArray(g.modifications) ? g.modifications.map((m: Record<string, unknown>) => ({ id: m.dish_modification_id, name: m.name, priceMajor: m.price })) : [] })) : [],
    })),
  }, null, 2));
}
main().catch(error => { console.error(error instanceof PosterError ? error.message : "Poster inspection failed; sensitive details omitted"); process.exitCode = 1; });

import dotenv from "dotenv";
import postgres from "postgres";
import { createPosterClient, PosterError } from "../lib/poster/client";

dotenv.config({ path: ".env.local", quiet: true });
dotenv.config({ quiet: true });
const normalize = (value: unknown) => String(value ?? "").normalize("NFKC").toLowerCase().replace(/\s+/g, " ").trim();

async function main() {
  const { settings, products } = await createPosterClient().inspect();
  const sql = postgres(process.env.DATABASE_URL!, { max: 1, prepare: false, connect_timeout: 10 });
  try {
    const local = await sql.begin("read only", async tx => {
      await tx`SET LOCAL statement_timeout = '8s'`;
      const main = await tx`SELECT p.slug, p.type, p.sku, coalesce(t.name,p.name) AS name, t.size FROM products p LEFT JOIN product_translations t ON t.product_id=p.id AND t.locale='ru' WHERE p.is_published ORDER BY p.type,p.slug`;
      const accessories = await tx`SELECT p.slug, p.name, p.volume_options, json_agg(json_build_object('id',v.id,'sku',v.sku,'color',v.color_label) ORDER BY v.sort_order) AS variants FROM accessory_products p JOIN accessory_variants v ON v.product_id=p.id AND v.is_active WHERE p.editorial_state='published' GROUP BY p.id ORDER BY p.slug`;
      return { main, accessories };
    });
    const candidates = products.flatMap(p => {
      const base = { productId: p.product_id, name: p.product_name, sku: p.product_code, kind: "product" };
      const modifications = Array.isArray(p.modifications) ? p.modifications.map(m => ({ productId: p.product_id, modifierId: m.modificator_id, name: m.modificator_name, sku: m.modificator_product_code, kind: "product-modifier" })) : [];
      const dishes = Array.isArray(p.group_modifications) ? p.group_modifications.flatMap(g => Array.isArray(g.modifications) ? g.modifications.map((m: Record<string, unknown>) => ({ productId: p.product_id, modifierId: m.dish_modification_id, name: m.name, sku: "", kind: "dish-modifier" })) : []) : [];
      return [base, ...modifications, ...dishes];
    });
    const rows = [...local.main.map(p => ({ slug: String(p.slug), name: String(p.name), type: String(p.type), skus: [p.sku] })), ...local.accessories.map(p => ({ slug: String(p.slug), name: String(p.name), type: "accessory", skus: p.variants.map((v: { sku: string }) => v.sku) as string[] }))];
    const matches = rows.map(p => ({ slug: p.slug, type: p.type, name: p.name, candidates: candidates.filter(c => (normalize(c.name) && normalize(c.name) === normalize(p.name)) || (normalize(c.sku) && p.skus.map(normalize).includes(normalize(c.sku)))) }));
    const skuCandidates = local.accessories.flatMap(p => p.variants.map((v: { id: string; sku: string; color: string }) => ({
      slug: p.slug, variantId: v.id, sku: v.sku, color: v.color, requiresVolumeReview: Array.isArray(p.volume_options) && p.volume_options.length > 0,
      candidates: candidates.filter(c => normalize(v.sku) && normalize(c.name).split(/[^\p{L}\p{N}-]+/u).includes(normalize(v.sku))),
    })));
    console.log(JSON.stringify({ ...settings, posterProducts: products.length, localCounts: { coffee: local.main.filter(p => p.type === "coffee").length, equipment: local.main.filter(p => p.type === "equipment").length, accessories: local.accessories.length },
      exactCandidateCount: matches.filter(p => p.candidates.length).length,
      // Candidates require review, especially colours, pack weights and mandatory modifier sets.
      exactCandidates: matches.filter(p => p.candidates.length),
      skuInNameSummary: { totalVariants: skuCandidates.length, uniqueCandidate: skuCandidates.filter(v => v.candidates.length === 1).length, ambiguous: skuCandidates.filter(v => v.candidates.length > 1).length, noCandidate: skuCandidates.filter(v => !v.candidates.length).length },
      skuInNameCandidates: process.argv.includes("--details") ? skuCandidates.filter(v => v.candidates.length) : skuCandidates.filter(v => v.candidates.length).slice(0, 5),
      unmatchedCoffee: matches.filter(p => p.type === "coffee" && !p.candidates.length).map(p => ({ slug: p.slug, name: p.name })),
      accessoryExamples: local.accessories.slice(0, 4),
    }, null, 2));
  } finally { await sql.end({ timeout: 5 }); }
}
main().catch(error => { console.error(error instanceof PosterError ? error.message : "Catalog comparison failed; sensitive details omitted"); process.exitCode = 1; });

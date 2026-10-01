// Generate an additive, repeatable Supabase migration from the local catalog.
// Run: node scripts/generate-kazakh-sql.mjs
import { readFileSync, writeFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function loadData(path) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS },
  }).outputText, { exports });
  return exports;
}
const { catalogItems } = loadData('app/catalog/catalog-data.ts');
const { equipmentItems } = loadData('app/catalog/equipment/equipment-data.ts');
const data = [
  ...catalogItems.map(item => ({ slug: item.slug, type: 'coffee', ...item.translations.kz })),
  ...equipmentItems.map(item => ({ slug: item.slug, type: 'equipment', name: item.name, ...item.translations.kz })),
];
const payload = JSON.stringify(data, null, 2);
if (payload.includes('$kazakh$')) throw new Error('SQL delimiter in catalog data');
const sql = `-- Run AFTER 20260924010000_kazakh_locale.sql has committed (a separate Run in SQL Editor).
-- Adds Kazakh copy for ${data.length} local products matched by slug AND type.
-- Existing KZ translations and all RU/EN content remain untouched.
-- Products created only in Supabase can be translated in Staff > KZ.
BEGIN;
DO $migration$
DECLARE
  item jsonb;
  product_record record;
  translation_id uuid;
BEGIN
  FOR item IN SELECT value FROM jsonb_array_elements($kazakh$
${payload}
$kazakh$::jsonb)
  LOOP
    SELECT id, status INTO product_record FROM public.products
      WHERE slug = item->>'slug' AND type::text = item->>'type' FOR UPDATE;
    IF NOT FOUND THEN CONTINUE; END IF;

    INSERT INTO public.product_translations
      (product_id, locale, name, size, notes, description, category, status_label)
    VALUES (
      product_record.id, 'kz', item->>'name', item->>'size', item->>'notes',
      COALESCE(item->>'description', ''), item->>'category',
      CASE WHEN item->>'type' = 'equipment' THEN CASE product_record.status::text
        WHEN 'in_stock' THEN 'Қолда бар'
        WHEN 'out_of_stock' THEN 'Қолда жоқ'
        ELSE 'Тапсырыспен' END ELSE NULL END
    )
    ON CONFLICT (product_id, locale) DO NOTHING
    RETURNING id INTO translation_id;

    IF translation_id IS NOT NULL THEN
      INSERT INTO public.product_details (product_id, locale, kind, label, value, sort_order)
      SELECT product_record.id, 'kz', 'detail', entry->>'label', entry->>'value', (position - 1)::integer
      FROM jsonb_array_elements(COALESCE(item->'details', '[]'::jsonb)) WITH ORDINALITY AS entries(entry, position);

      INSERT INTO public.product_details (product_id, locale, kind, label, value, sort_order)
      SELECT product_record.id, 'kz', 'specification', entry->>'label', entry->>'value', (position - 1)::integer
      FROM jsonb_array_elements(COALESCE(item->'specifications', '[]'::jsonb)) WITH ORDINALITY AS entries(entry, position);

      INSERT INTO public.product_features (product_id, locale, title, description, sort_order)
      SELECT product_record.id, 'kz', entry->>'title', entry->>'description', (position - 1)::integer
      FROM jsonb_array_elements(COALESCE(item->'features', '[]'::jsonb)) WITH ORDINALITY AS entries(entry, position);

      UPDATE public.products SET updated_at = now() WHERE id = product_record.id;
    END IF;
  END LOOP;
END;
$migration$;
COMMIT;
`;
writeFileSync('supabase/migrations/20260924020000_kazakh_catalog.sql', sql);
console.log(`Generated Kazakh catalog migration for ${data.length} products.`);

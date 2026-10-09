// Local-only PostgreSQL integration check. Never reads project DB credentials.
// Usage: node supabase/imports/validate_equipment_followup.mjs /absolute/path/to/stopped/test/pgdata
// Requires PostgreSQL 14+ `postgres` on PATH (or POSTGRES_BINARY).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const pgdata = process.argv[2];
if (!pgdata || !path.isAbsolute(pgdata) || !fs.existsSync(path.join(pgdata, 'PG_VERSION'))) {
  throw new Error('Pass an absolute path to a stopped, disposable local PostgreSQL cluster.');
}
const directory = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(directory, name), 'utf8');
const binary = process.env.POSTGRES_BINARY || 'postgres';
const database = `sketo_equipment_test_${Date.now()}`;
const previous = read('20261007_equipment_catalog.sql');
const sql = read('20261007_equipment_followup.sql');
const payload = JSON.parse(sql.split('$equipment$')[1]);
const setup = ['../migrations/20250814000000_catalog_schema.sql', '../migrations/20260814010000_editor_foundation.sql', '../migrations/20260924010000_kazakh_locale.sql', '../migrations/20261007010000_equipment_catalog_types.sql', '../migrations/20261007020000_equipment_accessory_type.sql'].map(read);
const run = (db, chunks, expectError = false) => {
  // Single-user -j uses an empty line as the end of a command, even inside strings.
  const input = chunks.map(s => s.replace(/\n[\t ]*\n/g, '\n')).join('\n\n') + '\n\n';
  const result = spawnSync(binary, ['--single', '-j', '-D', pgdata, db], { input, encoding: 'utf8', maxBuffer: 10e6 });
  if (result.error) throw result.error;
  const failed = result.status !== 0 || /(?:ERROR|FATAL|PANIC):/.test(result.stderr);
  if (failed !== expectError) throw new Error(result.stderr + result.stdout.slice(-6000));
  return result;
};
const assert = (condition, message) => `DO $check$ BEGIN IF NOT (${condition}) THEN RAISE EXCEPTION '${message}'; END IF; END $check$;`;
const snapshot = `SELECT jsonb_build_object(
  'products',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM products t),
  'translations',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_translations t),
  'details',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_details t),
  'features',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_features t),
  'images',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_images t),
  'audit',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM audit_logs t)
) AS state`;
const expectedDetails = payload.reduce((n, p) => n + 3 * (4 + p.translations.ru.specifications.length), 0);
const expectedFeatures = payload.reduce((n, p) => n + 3 * p.translations.ru.features.length, 0);


run('postgres', [`CREATE DATABASE ${database};`]);
try {
  const oldSnapshot = snapshot.replaceAll('FROM products t', "FROM products t WHERE slug NOT IN (SELECT unnest(slugs) FROM new_slugs)").replaceAll('FROM product_translations t', 'FROM product_translations t WHERE product_id IN (SELECT id FROM old_ids)').replaceAll('FROM product_details t', 'FROM product_details t WHERE product_id IN (SELECT id FROM old_ids)').replaceAll('FROM product_features t', 'FROM product_features t WHERE product_id IN (SELECT id FROM old_ids)').replaceAll('FROM product_images t', 'FROM product_images t WHERE product_id IN (SELECT id FROM old_ids)').replaceAll('FROM audit_logs t', 'FROM audit_logs t WHERE entity_id IN (SELECT id FROM old_ids)');
  run(database, [...setup, previous,
    "UPDATE products SET price_amount=98765,image_url='staff-photo',editorial_state='published',is_published=true WHERE slug='mahlkonig-e80s-gbw';",
    'CREATE TEMP TABLE old_ids AS SELECT id FROM products;',
    `CREATE TEMP TABLE new_slugs AS SELECT ARRAY[${payload.map(p=>"'"+p.slug+"'").join(',')}] AS slugs;`,
    `CREATE TEMP TABLE old_state AS ${oldSnapshot};`, sql,
    assert('(SELECT count(*) FROM products)=30', '22 previous plus eight new'),
    assert('(SELECT count(*) FROM product_translations)=90', '30 cards in three languages'),
    assert(`(SELECT state FROM old_state)=(${oldSnapshot})`, 'previous import or staff changes modified'),
    assert("(SELECT count(*) FROM products WHERE equipment_type='accessory')=1", 'accessory type'),
    assert("(SELECT count(*) FROM products WHERE slug IN ('mahlkonig-e80s-gbw','mahlkonig-e80w-gbs'))=2", 'GbW and GbS conflated'),
    assert("NOT EXISTS (SELECT 1 FROM products WHERE slug LIKE '%classic%')", 'excluded Classic inserted'),
    assert(`(SELECT count(*) FROM product_details WHERE product_id NOT IN (SELECT id FROM old_ids))=${expectedDetails}`, 'new details count'),
    assert(`(SELECT count(*) FROM product_features WHERE product_id NOT IN (SELECT id FROM old_ids))=${expectedFeatures}`, 'new features count'),
    assert("NOT EXISTS (SELECT 1 FROM products WHERE id NOT IN (SELECT id FROM old_ids) AND (editorial_state<>'draft' OR is_published OR price_amount IS NOT NULL))", 'new draft policy'),
    "UPDATE product_translations SET description='STAFF TEXT' WHERE locale='en' AND product_id=(SELECT id FROM products WHERE slug='la-marzocco-kb90');",
    "UPDATE product_images SET url='staff-image' WHERE product_id=(SELECT id FROM products WHERE slug='la-marzocco-kb90');",
    `CREATE TEMP TABLE snapshot_before AS ${snapshot};`, sql,
    assert(`(SELECT state FROM snapshot_before)=(${snapshot})`, 'rerun changed data'),
  ]);
  run(database, ["DELETE FROM products WHERE slug='la-marzocco-kb90';", "INSERT INTO products (slug,name,type,image_url,brand,equipment_type) VALUES ('e65-duplicate','E65W GbS','equipment','keep','mahlkonig','grinder');"]);
  const rejected=run(database,[sql],true);
  if (!rejected.stderr.includes('Several existing products match mahlkonig-e65w-gbs')) throw Error(rejected.stderr);
  run(database,[assert("NOT EXISTS (SELECT 1 FROM products WHERE slug='la-marzocco-kb90')",'conflict did not roll back')]);
  console.log('PASS: eight new drafts / 24 translations; previous 22 fully preserved; rerun stable after staff edits; distinct E80 models; accessory; excluded Classic; conflict rollback.');
} finally { run('postgres',[`DROP DATABASE ${database};`]); }

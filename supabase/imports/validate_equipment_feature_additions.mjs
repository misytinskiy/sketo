// Local-only PostgreSQL integration check. Never reads project DB credentials.
// Usage: node supabase/imports/validate_equipment_feature_additions.mjs /absolute/path/to/stopped/test/pgdata
// Requires PostgreSQL 14+ `postgres` on PATH (or POSTGRES_BINARY).
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';

const pgdata = process.argv[2];
if (pgdata && fs.existsSync(path.join(pgdata, 'postmaster.pid'))) throw Error('Cluster must be stopped.');
if (!pgdata || !path.isAbsolute(pgdata) || !fs.existsSync(path.join(pgdata, 'PG_VERSION'))) {
  throw new Error('Pass an absolute path to a stopped, disposable local PostgreSQL cluster.');
}
const directory = path.dirname(fileURLToPath(import.meta.url));
const read = name => fs.readFileSync(path.join(directory, name), 'utf8');
const binary = process.env.POSTGRES_BINARY || 'postgres';
const database = `sketo_equipment_test_${Date.now()}`;
const previous = read('20261007_equipment_catalog.sql');
const followup = read('20261007_equipment_followup.sql');
const sql = read('20261008_equipment_feature_additions.sql');
const payload = JSON.parse(sql.split('$features$')[1]);
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

const unchanged = `SELECT jsonb_build_object(
 'products',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM products t),
 'translations',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_translations t),
 'details',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_details t),
 'images',(SELECT jsonb_agg(to_jsonb(t) ORDER BY id) FROM product_images t)
) AS state`;
run('postgres', [`CREATE DATABASE ${database};`]);
try {
 run(database,[...setup,previous,followup,
  "UPDATE products SET price_amount=98765,image_url='staff-photo',is_published=true WHERE slug='mahlkonig-e80s-gbw';",
  "UPDATE product_features SET description='Staff edited description' WHERE locale='ru' AND product_id=(SELECT id FROM products WHERE slug='mahlkonig-e80s-gbw');",
  `CREATE TEMP TABLE keep_state AS ${unchanged};`,
  'CREATE TEMP TABLE keep_features AS SELECT * FROM product_features;', sql,
  assert('(SELECT count(*) FROM product_features)=(SELECT count(*)+168 FROM keep_features)','expected 168 additions'),
  assert("(SELECT count(*) FROM (SELECT product_id,locale FROM product_features GROUP BY product_id,locale HAVING count(*)=6) t)=87",'28 targets plus existing Linea, three locales'),
  assert('NOT EXISTS(SELECT * FROM keep_features EXCEPT SELECT * FROM product_features)','existing features modified'),
  assert(`(SELECT state FROM keep_state)=(${unchanged})`,'other catalog data modified'),
  `CREATE TEMP TABLE after_first AS ${snapshot};`,sql,
  assert(`(SELECT state FROM after_first)=(${snapshot})`,'rerun modified data'),
 ]);
 // Restore the imports for independent edge cases.
 run(database,['TRUNCATE products CASCADE;',previous,followup,
  "UPDATE products SET slug='custom-kb90-slug' WHERE slug='la-marzocco-kb90';",
  "UPDATE product_features SET title='Custom title' WHERE locale='ru' AND product_id=(SELECT id FROM products WHERE slug='anfim-luna');",
  "INSERT INTO product_features(product_id,locale,title,description,sort_order) SELECT id,'en','Manual fifth','Keep',4 FROM products WHERE slug='anfim-luna';",
  "DELETE FROM product_translations WHERE locale='kz' AND product_id=(SELECT id FROM products WHERE slug='anfim-luna');",
  "DELETE FROM products WHERE slug='puqpress-m3';",sql,
  assert("(SELECT count(*) FROM product_features WHERE product_id=(SELECT id FROM products WHERE slug='custom-kb90-slug'))=18",'alias match failed'),
  assert("(SELECT count(*) FROM product_features WHERE product_id=(SELECT id FROM products WHERE slug='anfim-luna') AND locale='ru')=4",'changed titles not skipped'),
  assert("(SELECT count(*) FROM product_features WHERE product_id=(SELECT id FROM products WHERE slug='anfim-luna') AND locale='en')=5",'five features not skipped'),
  assert("NOT EXISTS(SELECT 1 FROM products WHERE slug='puqpress-m3')",'missing product created'),
  assert("NOT EXISTS(SELECT 1 FROM product_translations WHERE product_id=(SELECT id FROM products WHERE slug='anfim-luna') AND locale='kz')",'missing translation created'),
 ]);
 run(database,["INSERT INTO products(slug,name,type,image_url,brand,equipment_type) VALUES('duplicate-kb90','KB90','equipment','','la-marzocco','espresso-machine');"]);
 const conflict=run(database,[sql],true);
 if (!conflict.stderr.includes('Several existing products match la-marzocco-kb90')) throw Error(conflict.stderr);
 console.log('PASS: 168 additions / 28 models / 3 locales; originals preserved; rerun unchanged; aliases; changed titles and five features skipped; missing products/translations skipped; ambiguous match rejected.');
} finally {run('postgres',[`DROP DATABASE ${database};`]);}

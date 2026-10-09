// Local-only PostgreSQL integration check. Never reads project DB credentials.
// Usage: node supabase/imports/validate_equipment_import.mjs /absolute/path/to/stopped/test/pgdata
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
const sql = read('20261007_equipment_catalog.sql');
const payload = JSON.parse(sql.split('$equipment$')[1]);
const setup = ['../migrations/20250814000000_catalog_schema.sql', '../migrations/20260814010000_editor_foundation.sql', '../migrations/20260924010000_kazakh_locale.sql', '../migrations/20261007010000_equipment_catalog_types.sql'].map(read);
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
  run(database, [...setup, sql,
    assert('(SELECT count(*) FROM products)=22', 'fresh product count'),
    assert('(SELECT count(*) FROM product_translations)=66', 'three locales per card'),
    assert(`(SELECT count(*) FROM product_details)=${expectedDetails}`, 'details count'),
    assert(`(SELECT count(*) FROM product_features)=${expectedFeatures}`, 'features count'),
    assert('(SELECT count(*) FROM product_images)=22', 'placeholder image count'),
    assert("NOT EXISTS (SELECT 1 FROM products WHERE is_published OR editorial_state<>'draft' OR price_amount IS NOT NULL OR price_display IS NOT NULL)", 'draft and price policy'),
    "UPDATE products SET image_url='staff-photo',price_amount=12345 WHERE slug='anfim-luna';",
    "UPDATE product_images SET url='staff-gallery' WHERE product_id=(SELECT id FROM products WHERE slug='anfim-luna');",
    "UPDATE product_translations SET description='STAFF EDIT' WHERE locale='en' AND product_id=(SELECT id FROM products WHERE slug='anfim-luna');",
    `CREATE TEMP TABLE snapshot_before AS ${snapshot};`, sql,
    assert(`(SELECT state FROM snapshot_before)=(${snapshot})`, 'repeat import changed data'),
    // Simulate an older PB X import stored under a different slug and generic name.
    "UPDATE products SET slug='la-marzocco-linea-pb-x',name='Linea PB X' WHERE slug='linea-pb-x-av-2-group';",
    "UPDATE product_translations SET name='Linea PB X' WHERE product_id=(SELECT id FROM products WHERE slug='la-marzocco-linea-pb-x');",
    `UPDATE snapshot_before SET state=(${snapshot});`, sql,
    assert(`(SELECT state FROM snapshot_before)=(${snapshot})`, 'legacy PB X alias changed data'),
    "SELECT 'EQUIPMENT_IMPORT_VALIDATED';",
  ]);
  // Two matching aliases must fail atomically, including inserts earlier in the file.
  run(database, ["DELETE FROM products WHERE slug='appia-life-s-2-group';",
    "INSERT INTO products (slug,name,type,image_url,brand,equipment_type) VALUES ('luna-duplicate','Anfim Luna','equipment','keep','anfim','grinder');"]);
  const rejected = run(database, [sql], true);
  if (!rejected.stderr.includes('Several existing products match anfim-luna')) throw Error(rejected.stderr);
  run(database, [assert("NOT EXISTS (SELECT 1 FROM products WHERE slug='appia-life-s-2-group')", 'conflict did not roll back earlier inserts')]);
  console.log('PASS: 22 drafts / 66 translations; exact details/features; no invented prices; same-session rerun; staff text/photos/prices preserved; legacy PB X alias; ambiguous duplicate rolls back atomically.');
} finally {
  run('postgres', [`DROP DATABASE ${database};`]);
}

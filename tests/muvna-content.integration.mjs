// Isolated local PostgreSQL only. Never reads production environment variables.
// Requires the disposable cluster on /tmp/sketo-muvna-pg.XKZReR:55439.
import postgres from 'postgres';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
const options = { host: '/tmp/sketo-muvna-pg.XKZReR', port: 55439, username: 'postgres', max: 1 };
const admin = postgres({ ...options, database: 'postgres' });
const database = `muvna_content_test_${Date.now()}`;
await admin.unsafe(`CREATE DATABASE ${database}`);
await admin.end();
const db = postgres({ ...options, database });
const products = JSON.parse(readFileSync('supabase/imports/20261012_muvna_catalog.json', 'utf8'));
const supplement = readFileSync('supabase/imports/20261015_muvna_content.sql', 'utf8');
try {
  await db.unsafe(`
    CREATE TYPE public.locale AS ENUM ('ru','en','kz');
    CREATE TABLE accessory_products (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), slug text UNIQUE, brand text, name text,
      attributes jsonb NOT NULL DEFAULT '{}', editorial_state text DEFAULT 'draft', updated_at timestamptz DEFAULT now()
    );
    CREATE TABLE accessory_variants (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(), product_id uuid REFERENCES accessory_products,
      sku text UNIQUE, retail_price numeric, stock_quantity integer
    );
    CREATE TABLE accessory_translations (
      product_id uuid REFERENCES accessory_products, locale public.locale, name text NOT NULL,
      description text NOT NULL DEFAULT '', PRIMARY KEY(product_id,locale)
    );
  `);
  for (const p of products) {
    const [{ id }] = await db`INSERT INTO accessory_products(slug,brand,name,attributes)
      VALUES (${p.slug},'muvna',${p.name},${db.json(p.attributes)}) RETURNING id`;
    await db`INSERT INTO accessory_translations VALUES (${id},'ru',${p.name},${p.description})`;
    for (const v of p.variants) await db`INSERT INTO accessory_variants(product_id,sku,retail_price,stock_quantity)
      VALUES (${id},${v.sku},12345,7)`;
  }
  const [{ id }] = await db`SELECT id FROM accessory_products ORDER BY slug LIMIT 1`;
  await db`INSERT INTO accessory_translations VALUES (${id},'en','Manual name','Manual description')`;
  await db`UPDATE accessory_products SET attributes=${db.json({ operation: { ru: 'Ручное значение', en: '' }, power_w: 0, timer: false, material: 'Custom' })} WHERE id=${id}`;
  const beforeRu = await db`SELECT * FROM accessory_translations WHERE locale='ru' ORDER BY product_id`;
  const beforeVariants = await db`SELECT * FROM accessory_variants ORDER BY id`;
  await db.unsafe(supplement);
  assert.equal((await db`SELECT count(*)::int AS n FROM accessory_translations`)[0].n, 330);
  assert.equal((await db`SELECT count(*)::int AS n FROM accessory_translations WHERE btrim(description)=''`)[0].n, 0);
  assert.deepEqual(await db`SELECT * FROM accessory_translations WHERE locale='ru' ORDER BY product_id`, beforeRu);
  assert.deepEqual(await db`SELECT * FROM accessory_variants ORDER BY id`, beforeVariants);
  assert.equal((await db`SELECT description FROM accessory_translations WHERE product_id=${id} AND locale='en'`)[0].description, 'Manual description');
  const attrs = (await db`SELECT attributes FROM accessory_products WHERE id=${id}`)[0].attributes;
  assert.equal(attrs.operation.ru, 'Ручное значение');
  assert.equal(attrs.operation.en, 'Manual');
  assert.equal(attrs.power_w, 0);
  assert.equal(attrs.timer, false);
  assert.equal(attrs.material, 'Custom');
  assert.equal((await db`SELECT count(*)::int AS n FROM accessory_products WHERE editorial_state<>'draft'`)[0].n, 0);
  const snapshot = await db`SELECT * FROM accessory_products ORDER BY id`;
  const translations = await db`SELECT * FROM accessory_translations ORDER BY product_id,locale`;
  await db.unsafe(supplement);
  assert.deepEqual(await db`SELECT * FROM accessory_products ORDER BY id`, snapshot);
  assert.deepEqual(await db`SELECT * FROM accessory_translations ORDER BY product_id,locale`, translations);
  // Missing SKU aborts the entire transaction before any content is changed.
  await db`UPDATE accessory_variants SET sku='TEST-CHANGED' WHERE sku=${products[0].variants[0].sku}`;
  await assert.rejects(db.unsafe(supplement), /SKU groups missing or changed/);
  await db.unsafe('ROLLBACK');
  assert.deepEqual(await db`SELECT * FROM accessory_products ORDER BY id`, snapshot);
  assert.deepEqual(await db`SELECT * FROM accessory_translations ORDER BY product_id,locale`, translations);
  console.log('PASS: 110 cards, 330 translations, preserved manual content/prices/stocks/statuses, idempotency, atomic mismatch rejection.');
  console.log(`Test database retained for inspection: ${database}`);
} finally {
  await db.end();
}

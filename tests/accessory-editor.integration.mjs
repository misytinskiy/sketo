// Explicit local-only integration runner. Never reads DATABASE_URL or .env.
// Run after the Sketo bootstrap + accessories migration in this temporary cluster.
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as orm from 'drizzle-orm';
import * as pg from 'drizzle-orm/pg-core';
import sharp from 'sharp';

const host = process.argv[2];
if (!host?.startsWith('/tmp/sketo-muvna-pg.')) throw new Error('Pass an isolated /tmp/sketo-muvna-pg.* socket directory');
const client = postgres({ host, port: 55439, user: 'postgres', database: 'postgres', prepare: false, max: 1, connect_timeout: 3 });
function load(path, modules = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, esModuleInterop: true },
  }).outputText, { exports, require: (key) => { assert.ok(key in modules, key); return modules[key]; }, File, Buffer, crypto });
  return exports;
}
const schema = load('lib/db/schema.ts', { 'drizzle-orm': orm, 'drizzle-orm/pg-core': pg });
const db = drizzle(client, { schema });
const model = load('app/staff/accessories/editor-model.ts');
const validation = load('lib/supabase/media-validation.ts');
const actorId = crypto.randomUUID();
const productId = crypto.randomUUID();
const variantId = crypto.randomUUID();
const newVariantId = crypto.randomUUID();
const actor = async () => ({ id: actorId });
const data = load('app/staff/accessories/editor-data.ts', {
  'server-only': {}, 'drizzle-orm': orm, '@/lib/db/bounded': { withBoundedDatabase: (_lane, run) => db.transaction(run) }, '@/lib/staff-auth': { requireStaff: actor }, './editor-model': model,
});
const uploads = [];
let failUpload = false;
const actions = load('app/staff/accessories/editor-actions.ts', {
  'drizzle-orm': orm, sharp, 'next/cache': { revalidatePath() {}, updateTag() {} }, '@/lib/db/bounded': { withBoundedDatabase: (_lane, run) => db.transaction(run) }, '@/lib/db/schema': schema,
  '@/lib/staff-auth': { requireStaff: actor }, '@/lib/supabase/media-validation': validation,
  './editor-model': model, './editor-data': data,
  '@/lib/supabase/admin': { createAdminClient: () => ({ storage: { from: (bucket) => {
    assert.equal(bucket, 'catalog');
    return {
      upload: async (path, bytes, options) => {
        if (failUpload) return { error: new Error('simulated storage outage') };
        assert.equal(options.upsert, false);
        assert.equal((await sharp(bytes).metadata()).format, 'webp');
        uploads.push(path);
        return { error: null };
      },
      getPublicUrl: (path) => ({ data: { publicUrl: `https://example.invalid/storage/${path}` } }),
    };
  } } }) },
});
function normalize(p) {
  return { ...p, translations: ['ru','en','kz'].map((locale) => p.translations.find((t) => t.locale === locale) ?? { locale, name: '', description: '' }) };
}
async function save(p, file, variant = '') {
  const form = new FormData();
  form.set('product', JSON.stringify(normalize(p)));
  if (file) { form.set('photo', file); form.set('photoVariant', variant); }
  return actions.saveAccessory({}, form);
}
try {
  await client`INSERT INTO staff_members(id,user_id,email,role) VALUES(${actorId},${crypto.randomUUID()},${`accessory-test-${actorId}@example.invalid`},'editor')`;
  await client`INSERT INTO accessory_products(id,slug,brand,category,name) VALUES(${productId},${`test-${productId}`},'muvna','scales','Test')`;
  await client`INSERT INTO accessory_translations(product_id,locale,name,description) VALUES(${productId},'ru','Весы','Описание')`;
  await client`INSERT INTO accessory_variants(id,product_id,sku,color_code,color_label,retail_price) VALUES(${variantId},${productId},${`SKU-${variantId}`},'black','Чёрный',100)`;
  let p = await data.getAccessoryEditor(productId);
  const stale = structuredClone(p);
  p.variants[0].price = '1234.56';
  p.variants[0].stock = 5;
  p.variants[0].inventoryVerified = true;
  p.variants[0].priceVerified = true;
  p.attributes = { volume_ml: 450 };
  let result = await save(p);
  assert.equal(result.status, 'success', result.message);
  p = result.product;
  assert.equal(p.variants[0].price, '1234.56');
  assert.equal(p.attributes.volume_ml, 450);
  assert.notEqual(p.version, stale.version);
  assert.equal((await save(stale)).status, 'error');
  const [stock] = await client`SELECT stock_recorded_at IS NOT NULL AS recorded FROM accessory_variants WHERE id=${variantId}`;
  assert.equal(stock.recorded, true);

  p.variants.push({ ...p.variants[0], id: newVariantId, sku: `SKU-${newVariantId}`, code: 'white', color: 'Белый' });
  result = await save(p); assert.equal(result.status, 'success', result.message); p = result.product;
  assert.equal(p.variants.length, 2);

  const png = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
  const file = new File([png], 'photo.png', { type: 'image/png' });
  assert.equal((await save(p, new File(['not an image'], 'bad.png', { type: 'image/png' }))).status, 'error');
  assert.equal(uploads.length, 0);
  result = await save(p, file, variantId); assert.equal(result.status, 'success', result.message); p = result.product;
  assert.equal(uploads.length, 1);
  assert.equal(p.images[0].variantId, variantId);
  assert.equal(p.images[0].approved, true);
  p.state = 'published';
  result = await save(p); assert.equal(result.status, 'success', result.message); p = result.product;
  assert.equal(p.state, 'published');

  const beforeFailure = p.version;
  failUpload = true;
  result = await save(p, file);
  assert.equal(result.status, 'error');
  assert.equal((await data.getAccessoryEditor(productId)).version, beforeFailure);
  failUpload = false;
  p.state = 'archived';
  p.images = [];
  result = await save(p); assert.equal(result.status, 'success', result.message); p = result.product;
  assert.equal(p.images.length, 0);
  assert.equal(p.state, 'archived');
  const [audit] = await client`SELECT count(*)::int AS count FROM audit_logs WHERE entity_id=${productId} AND diff->>'catalog'='accessories'`;
  assert.ok(audit.count >= 5);
  console.log('PASS: PostgreSQL save/read, decimals, timestamps, conflict rejection, new colour, WebP upload/association, publication, upload failure rollback, archive, photo detachment and audit.');
} finally { await client.end({ timeout: 1 }); }

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as orm from 'drizzle-orm';
import * as pg from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';
import * as crypto from 'node:crypto';

function load(path, modules, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, {
    exports, require: (name) => { assert.ok(name in modules, name); return modules[name]; }, Date, Buffer, ...globals,
  });
  return exports;
}
const schema = load('lib/db/schema.ts', { 'drizzle-orm': orm, 'drizzle-orm/pg-core': pg });
const db = drizzle.mock({ schema });
const editor = load('lib/db/editor.ts', {
  'drizzle-orm': orm, '@/lib/db': { db }, '@/lib/db/schema': schema,
  '@/lib/supabase/storage-public': { resolveCoffeeStorageUrl: (path) => path, resolveEquipmentStorageUrl: (path) => path },
});

test('editor relations compile into a single SQL statement', () => {
  const query = db.query.products.findFirst({ where: orm.eq(schema.products.slug, 'example'), with: editor.editorProductRelations() }).toSQL();
  assert.match(query.sql, /join lateral/i);
  for (const table of ['product_translations', 'product_details', 'product_features', 'product_images']) assert.ok(query.sql.includes(table));
  assert.equal(query.params.filter((param) => param === 'example').length, 1);
});

test('batch revisions use one read and one insert, preserving raw media paths', async () => {
  let reads = 0, inserts = 0;
  const rows = Array.from({ length: 100 }, (_, i) => ({
    id: String(i), slug: `item-${i}`, imageUrl: 'raw/file.webp',
    translations: [], details: [], features: [], images: [{ url: 'raw/file.webp' }], revisions: [{ version: i }],
  }));
  const tx = {
    query: { products: { findMany: async () => { reads++; return rows; } } },
    insert: () => ({ values: (values) => { inserts++; return { returning: async () => values }; } }),
  };
  const revisions = await editor.createProductRevisionSnapshots({ productIds: rows.map((row) => row.id) }, tx);
  assert.equal(reads, 1); assert.equal(inserts, 1); assert.equal(revisions.length, 100);
  assert.equal(revisions[99].version, 100);
  assert.equal(revisions[0].payload.images[0].url, 'raw/file.webp');
  assert.equal('revisions' in revisions[0].payload.product, false);
});

test('empty revision batch performs no queries', async () => {
  const result = await editor.createProductRevisionSnapshots({ productIds: [] }, {});
  assert.equal(result.length, 0);
});

const preview = load('lib/staff-preview.ts', { 'node:crypto': crypto }, { process: { env: { STAFF_PREVIEW_SECRET: 'test-only-secret' } } });
test('preview token only authorizes its product and expires', () => {
  const now = Date.now();
  const link = preview.createPreviewHref('coffee', 'sample', now);
  const token = new URL(link, 'https://example.test').searchParams.get('token');
  assert.equal(preview.verifyPreviewToken('coffee', 'sample', token, now), true);
  assert.equal(preview.verifyPreviewToken('equipment', 'sample', token, now), false);
  assert.equal(preview.verifyPreviewToken('coffee', 'another-product', token, now), false);
  assert.equal(preview.verifyPreviewToken('coffee', 'sample', token, now + 15 * 60 * 1000), false);
  assert.equal(preview.verifyPreviewToken('coffee', 'sample', `${token}bad`, now), false);
  assert.equal(preview.verifyPreviewToken('coffee', 'sample', '', now), false);
});

test('cleanup count deduplicates files and excludes fresh jobs without a failure', async () => {
  let query;
  const cleanup = load('lib/supabase/media-cleanup.ts', {
    'drizzle-orm': orm, '@/lib/db/schema': schema, '@/lib/db/editor': {}, './admin': {}, './storage-public': {},
    '@/lib/db': { db: { select: (fields) => ({ from: (table) => ({ where: async (condition) => {
      query = db.select(fields).from(table).where(condition).toSQL();
      return [{ count: 2 }];
    } }) }) } },
  });
  assert.equal(await cleanup.getPendingMediaCleanupCount(), 2);
  assert.match(query.sql, /count\(distinct/i);
  assert.match(query.sql, /cleanupPending/);
  assert.match(query.sql, /cleanupFailed/);
  assert.match(query.sql, /15 minutes/);
  assert.ok(query.params.includes('media'));
});

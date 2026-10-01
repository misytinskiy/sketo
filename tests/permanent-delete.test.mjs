import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function setup({ state = 'archived', auditFailure = false, storageFailure = false } = {}) {
  const tables = Object.fromEntries(['products', 'productImages', 'productTranslations', 'productMedia', 'mediaAssets'].map((key) => [key, { id: key }]));
  const writes = [], queued = [], cleaned = [], tags = [];
  const product = { id: 'product', editorialState: state, isPublished: state === 'published', name: 'Coffee', imageUrl: 'coffee/main.webp', updatedAt: new Date('2026-09-08T00:00:00Z') };
  const db = {
    select: () => ({ from: (table) => {
      const result = table === tables.productImages ? [{ url: 'coffee/main.webp' }, { url: 'data:image/svg+xml,example' }, { url: 'https://external.example/image.webp' }] : [{ path: 'coffee/second.webp', bucket: 'catalog' }];
      const query = { where: () => ({ for: async () => [product], then: (resolve) => resolve(result) }), innerJoin: () => query };
      return query;
    } }),
    query: { productTranslations: { findFirst: async () => ({ name: 'Coffee' }) } },
    delete: (table) => ({ where: async () => writes.push(table) }),
    transaction: async (callback) => {
      try { return await callback(db); } catch (error) { writes.length = 0; queued.length = 0; throw error; }
    },
  };
  const exports = {};
  const modules = {
    "@/lib/staff-auth": { requireStaff: async () => ({ id: "staff", role: "staff" }) },
    'drizzle-orm': { and: () => null, eq: () => null },
    'next/cache': { updateTag: (tag) => tags.push(tag), revalidatePath: () => {} },
    '@/lib/db': { db }, '@/lib/db/schema': tables,
    '@/lib/db/editor': { appendAuditLog: async (_, tx) => { assert.equal(tx, db); if (auditFailure) throw new Error('audit unavailable'); } },
    '@/lib/supabase/media-cleanup': {
      queueMediaCleanup: async (kind, path, tx) => { assert.equal(tx, db); queued.push(path); return { id: path }; },
      processMediaCleanup: async (ids) => { assert.equal(writes.length, 1, 'Cleanup only runs after committed deletion'); cleaned.push(...ids); if (storageFailure) throw new Error('offline'); return 0; },
    },
    '@/lib/supabase/storage-public': { getStorageBucketName: () => 'catalog', normalizeStorageObjectPath: (_, path) => path },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync('app/staff/permanent-delete.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, {
    exports, require: (name) => modules[name], process: { env: {} }, console: { error: () => {} },
  });
  return { writes, queued, cleaned, tags, run: async (fields = {}) => {
    const data = new FormData();
    for (const [key, value] of Object.entries({ kind: 'coffee', slug: 'sample', version: product.updatedAt.toISOString(), ...fields })) data.set(key, value);
    return exports.permanentlyDeleteProduct(data);
  } };
}

test('permanent deletion queues unique storage files, deletes product and invalidates its catalog', async () => {
  const s = setup();
  assert.equal((await s.run()).status, 'success');
  assert.equal(s.writes.length, 1);
  assert.deepEqual(s.queued, ['coffee/main.webp', 'coffee/second.webp']);
  assert.deepEqual(s.cleaned, s.queued);
  assert.deepEqual(s.tags, ['staff-products', 'coffee-catalog']);
});
for (const state of ['draft', 'published']) test(`permanent deletion rejects ${state} products`, async () => {
  const s = setup({ state });
  assert.equal((await s.run()).status, 'error');
  assert.equal(s.writes.length, 0);
  assert.equal(s.queued.length, 0);
});
for (const fields of [{ version: 'stale' }, { kind: 'invalid' }]) test(`invalid deletion request is rejected: ${JSON.stringify(fields)}`, async () => {
  const s = setup();
  assert.equal((await s.run(fields)).status, 'error');
  assert.equal(s.writes.length, 0);
  assert.equal(s.cleaned.length, 0);
});
test('audit failure rolls back deletion and cleanup jobs', async () => {
  const s = setup({ auditFailure: true });
  assert.equal((await s.run()).status, 'error');
  assert.equal(s.writes.length, 0);
  assert.equal(s.queued.length, 0);
  assert.equal(s.cleaned.length, 0);
});
test('Storage outage does not report committed deletion as failure', async () => {
  const s = setup({ storageFailure: true });
  const result = await s.run();
  assert.equal(result.status, 'success');
  assert.match(result.message, /очередь/);
  assert.equal(s.queued.length, 2);
});

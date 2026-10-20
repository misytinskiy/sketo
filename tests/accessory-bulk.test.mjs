import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

const id = 'ab79098a-2222-4333-8444-123456789abc';
function setup({ active = true, version = 'v1', state = 'published' } = {}) {
  const queries = [], logs = [], tags = [], removed = [];
  const modules = {
    'drizzle-orm': { sql }, 'next/cache': { revalidatePath() {}, updateTag: tag => tags.push(tag) },
    '@/lib/staff-auth': { requireStaff: async () => ({ id }) },
    '@/lib/db/schema': { auditLogs: {} }, './editor-model': { uuidPattern: /^[0-9a-f-]{36}$/ },
    '@/lib/supabase/admin': { createAdminClient: () => ({ storage: { from: bucket => {
      assert.equal(bucket, 'catalog');
      return { remove: async paths => { removed.push(...paths); return { error: null }; } };
    } } }) },
    '@/lib/db/bounded': { withBoundedDatabase: async (_lane, run) => run({
      execute: async query => {
        const q = new PgDialect().sqlToQuery(query); queries.push(q);
        if (q.sql.includes('FROM staff_members')) return active ? [{ id }] : [];
        if (q.sql.includes('SELECT id,name')) return [{ id, name: 'Item', slug: 'item', version, editorial_state: state }];
        if (q.sql.includes('accessory_images')) return [{ product_id: id, url: `https://example.supabase.co/storage/v1/object/public/catalog/accessories/${id}/photo.webp` }];
        return [];
      }, insert: () => ({ values: async values => logs.push(...values) }),
    }) },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync('app/staff/accessories/bulk-actions.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, URL, require: name => { assert.ok(name in modules, name); return modules[name]; } });
  return {
    run: (restore = false) => exports.changeAccessoryStates([{ id, version: 'v1' }], restore),
    delete: () => exports.permanentlyDeleteAccessories([{ id, version: 'v1' }]),
    queries, logs, tags, removed,
  };
}
test('archive updates state, writes audit and invalidates public catalog', async () => {
  const s = setup(); await s.run();
  assert.ok(s.queries.find(q => q.sql.startsWith('UPDATE')).params.includes('archived'));
  assert.equal(s.logs[0].diff.after, 'archived');
  assert.deepEqual(s.tags, ['accessories-catalog']);
});
test('restore returns to draft, never publishes automatically', async () => {
  const s = setup({ state: 'archived' }); await s.run(true);
  assert.equal(s.logs[0].diff.after, 'draft');
});
test('stale versions and revoked access cannot update products', async () => {
  for (const options of [{ version: 'v2' }, { active: false }, { state: 'archived' }]) {
    const s = setup(options); await assert.rejects(s.run());
    assert.equal(s.queries.some(q => q.sql.startsWith('UPDATE')), false);
    assert.equal(s.logs.length, 0);
  }
});
test('permanent deletion only accepts archived current cards and removes owned accessory files', async () => {
  const s = setup({ state: 'archived' });
  const result = await s.delete();
  assert.equal(result.status, 'success');
  assert.ok(s.queries.some(q => q.sql.startsWith('DELETE FROM accessory_products')));
  assert.deepEqual(s.removed, [`accessories/${id}/photo.webp`]);
  assert.equal(s.logs[0].action, 'delete');
  assert.deepEqual(s.tags, ['accessories-catalog']);

  for (const options of [{ state: 'draft' }, { state: 'published' }, { state: 'archived', version: 'v2' }, { state: 'archived', active: false }]) {
    const invalid = setup(options);
    await assert.rejects(invalid.delete());
    assert.equal(invalid.queries.some(q => q.sql.startsWith('DELETE FROM accessory_products')), false);
    assert.deepEqual(invalid.removed, []);
  }
});

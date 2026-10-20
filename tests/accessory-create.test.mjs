import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

const id = 'ab79098a-2222-4333-8444-123456789abc';
function setup({ authorised = true, active = true, existing = false } = {}) {
  const queries = [], logs = [], paths = [];
  const modules = {
    'drizzle-orm': { sql }, 'next/cache': { revalidatePath: p => paths.push(p) },
    '@/lib/staff-auth': { requireStaff: async () => { if (!authorised) throw new Error('unauthorised'); return { id }; } },
    '@/lib/db/schema': { auditLogs: {} },
    './editor-model': { uuidPattern: /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i },
    '@/lib/db/bounded': { withBoundedDatabase: async (lane, run) => {
      assert.equal(lane, 'accessory-write');
      return run({ execute: async query => {
        const compiled = new PgDialect().sqlToQuery(query); queries.push(compiled);
        if (compiled.sql.includes('FROM staff_members')) return active ? [{ id }] : [];
        if (compiled.sql.includes('RETURNING id')) return existing ? [] : [{ id }];
        return [];
      }, insert: () => ({ values: async value => logs.push(value) }) });
    } },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync('app/staff/accessories/create-action.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, require: name => { assert.ok(name in modules, name); return modules[name]; } });
  const form = new FormData(); form.set('requestId', id);
  return { run: () => exports.createAccessory(form), form, queries, logs, paths };
}
test('creates a draft with three translations and an available variant', async () => {
  const s = setup();
  assert.equal((await s.run()).href, `/staff/accessories/edit/${id}`);
  assert.equal(s.queries.filter(q => q.sql.includes('INSERT INTO accessory_translations')).length, 3);
  assert.match(s.queries.find(q => q.sql.includes('INSERT INTO accessory_products')).sql, /'draft'/);
  assert.match(s.queries.find(q => q.sql.includes('INSERT INTO accessory_variants')).sql, /'in_stock'/);
  assert.equal(s.logs.length, 1);
  assert.ok(s.paths.includes('/staff'));
});
test('retry returns the existing editor without inserting variants, translations or audit twice', async () => {
  const s = setup({ existing: true });
  assert.equal((await s.run()).href, `/staff/accessories/edit/${id}`);
  assert.equal(s.queries.length, 2);
  assert.equal(s.logs.length, 0);
});
test('unauthorised and revoked staff cannot create products', async () => {
  const denied = setup({ authorised: false });
  await assert.rejects(denied.run(), /unauthorised/);
  assert.equal(denied.queries.length, 0);
  const revoked = setup({ active: false });
  await assert.rejects(revoked.run(), /отозван/);
  assert.equal(revoked.queries.length, 1);
});
test('invalid request IDs are rejected before accessing the database', async () => {
  const s = setup(); s.form.set('requestId', 'invalid');
  await assert.rejects(s.run(), /идентификатор/);
  assert.equal(s.queries.length, 0);
});

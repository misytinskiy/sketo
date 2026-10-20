import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
import ts from 'typescript';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';

function harness() {
  const clients = [], statements = [], modes = [];
  const timers = new Set();
  const exports = {};
  const modules = {
    'server-only': {}, './schema': {}, 'drizzle-orm': { sql },
    postgres: { default: (_url, options) => {
      const client = { options, closed: false, end: async ({ timeout }) => { assert.equal(timeout, 0); client.closed = true; } };
      clients.push(client); return client;
    } },
    'drizzle-orm/postgres-js': { drizzle: () => ({ transaction: async (run, options) => {
      modes.push(options.accessMode);
      return run({ execute: async query => { statements.push(new PgDialect().sqlToQuery(query).sql); return []; } });
    } }) },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync('lib/db/bounded.ts', 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
  }).outputText, { exports, require: name => { assert.ok(name in modules, name); return modules[name]; },
    process: { env: { DATABASE_URL: 'postgres://test.invalid/test' } },
    setTimeout: fn => { const timer = setTimeout(() => { timers.delete(timer); fn(); }, 30); timers.add(timer); return timer; },
    clearTimeout: timer => { timers.delete(timer); clearTimeout(timer); },
  });
  return { ...exports, clients, statements, modes, timers };
}
test('read-only transaction sets actual local timeouts and closes its owned connection', async () => {
  const h = harness();
  assert.equal(await h.withBoundedDatabase('accessory-read', async () => 42), 42);
  assert.deepEqual(h.modes, ['read only']);
  assert.ok(h.statements.includes("SET LOCAL statement_timeout = '8s'"));
  assert.ok(h.statements.includes("SET LOCAL lock_timeout = '2s'"));
  assert.equal(h.clients[0].closed, true);
  assert.equal(h.timers.size, 0);
});
test('hung accessory reads time out, close sockets and do not block auth or writes', async () => {
  const h = harness();
  const hung = Array.from({ length: 3 }, () => assert.rejects(h.withBoundedDatabase('accessory-read', () => new Promise(() => {})), /Превышено время/));
  await assert.rejects(h.withBoundedDatabase('accessory-read', async () => 1), /Сервис занят/);
  assert.equal(await h.withBoundedDatabase('staff-auth', async () => 'staff'), 'staff');
  assert.equal(await h.withBoundedDatabase('accessory-write', async () => 'saved'), 'saved');
  await Promise.all(hung);
  assert.ok(h.clients.every(c => c.closed));
  assert.equal(await h.withBoundedDatabase('accessory-read', async () => 'recovered'), 'recovered');
});
test('failed and ambiguous writes are never retried; slots and timers are released', async () => {
  const h = harness(); let attempts = 0;
  await assert.rejects(h.withBoundedDatabase('accessory-write', async () => { attempts++; throw new Error('rollback'); }), /rollback/);
  await assert.rejects(h.withBoundedDatabase('accessory-write', async () => { attempts++; return new Promise(() => {}); }), /проверьте результат/);
  assert.equal(attempts, 2);
  assert.ok(h.clients.every(c => c.closed));
  assert.equal(h.timers.size, 0);
  assert.equal(await h.withBoundedDatabase('accessory-write', async () => 'ok'), 'ok');
});

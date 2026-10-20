// Read-only diagnostic. Never prints connection strings or product contents.
import env from '@next/env';
import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';
import { sql } from 'drizzle-orm';
import * as orm from 'drizzle-orm';
import * as pg from 'drizzle-orm/pg-core';
import ts from 'typescript';
import vm from 'node:vm';
import { readFileSync } from 'node:fs';
env.loadEnvConfig(process.cwd());
function load(file, modules) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 },
  }).outputText, { exports, process, setTimeout, clearTimeout, require: name => { if (!(name in modules)) throw new Error(`Unexpected import: ${name}`); return modules[name]; } });
  return exports;
}
try {
  const schema = load('lib/db/schema.ts', { 'drizzle-orm': orm, 'drizzle-orm/pg-core': pg });
  const bounded = load('lib/db/bounded.ts', { 'server-only': {}, postgres: { default: postgres },
    'drizzle-orm/postgres-js': { drizzle }, 'drizzle-orm': { sql }, './schema': schema });
  // All diagnostic operations stay read-only, including deliberately slow queries.
  const modules = { 'server-only': {}, 'drizzle-orm': { sql }, '@/lib/db/bounded': bounded, react: { cache: f => f },
      'next/cache': { unstable_cache: f => f }, // Intentionally measure cold SQL outside the Next runtime.
      '@/lib/staff-auth': { requireStaff: async () => {} }, './editor-model': { uuidPattern: /^[0-9a-f-]{36}$/i } };
    const [sample] = await bounded.withBoundedDatabase('accessory-read', db => db.execute(sql`select id from accessory_products limit 1`));
    for (const [name, run] of [
      ['public-catalog', () => load('app/accessories/data.ts', modules).getAccessories()],
      ['staff-catalog', () => load('app/staff/accessories/data.ts', modules).getStaffAccessories()],
      ['staff-editor', () => sample ? load('app/staff/accessories/editor-data.ts', modules).getAccessoryEditor(sample.id) : null],
    ]) {
      const start = performance.now();
      const result = await run();
      console.log(JSON.stringify({ name, ms: Math.round(performance.now() - start), rows: Array.isArray(result) ? result.length : Number(Boolean(result)) }));
    }
  if (process.argv.includes('--timeout-test')) {
    const start = performance.now();
    const slow = bounded.withBoundedDatabase('accessory-read', db => db.execute(sql`select pg_sleep(15)`))
      .then(() => { throw new Error('Expected SQL timeout'); }, error => {
        const code = error.code ?? error.cause?.code;
        if (code !== '57014') throw error;
        console.log(JSON.stringify({ name: 'slow-query-cancelled', code, ms: Math.round(performance.now() - start) }));
      });
    await bounded.withBoundedDatabase('staff-auth', db => db.execute(sql`select 1`));
    console.log(JSON.stringify({ name: 'auth-independent', ms: Math.round(performance.now() - start) }));
    await slow;
    await bounded.withBoundedDatabase('accessory-read', db => db.execute(sql`select 1`));
    console.log(JSON.stringify({ name: 'recovered-after-timeout', ok: true }));
  }
} catch (error) {
  console.log(JSON.stringify({ error: error.code ?? error.cause?.code ?? 'unknown', message: String(error.cause?.message ?? error.message).replace(/Failed query:[\s\S]*/, 'SQL execution failed').slice(0, 300) }));
  process.exitCode = 1;
}

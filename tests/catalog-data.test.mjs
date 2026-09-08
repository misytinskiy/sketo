import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as orm from 'drizzle-orm';
import * as pg from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';

function load(path, modules) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, {
    exports, require: (name) => { assert.ok(name in modules, name); return modules[name]; },
  });
  return exports;
}
const schema = load('lib/db/schema.ts', { 'drizzle-orm': orm, 'drizzle-orm/pg-core': pg });
const sqlDb = drizzle.mock({ schema });
function setup(kind, row, failure) {
  const queries = [], caches = [];
  const db = { query: { products: {
    findMany: async (query) => { queries.push(query); if (failure) throw failure; return row ? [row] : []; },
    findFirst: async (query) => { queries.push(query); if (failure) throw failure; return row; },
  } } };
  const api = load(kind === 'coffee' ? 'app/catalog/catalog-db.ts' : 'app/catalog/equipment/equipment-db.ts', {
    'drizzle-orm': orm, '@/lib/db': { db }, '@/lib/db/schema': schema,
    'react': { cache: (fn) => fn },
    'next/cache': { unstable_cache: (fn, key, options) => { caches.push({ key, options }); return fn; } },
    '@/lib/supabase/storage-public': { resolveCoffeeStorageUrl: (url) => url, resolveEquipmentStorageUrl: (url) => url },
  });
  return { api, queries, caches };
}
const row = {
  slug: 'linea-mini-r', name: 'Example', imageUrl: 'main.webp', priceDisplay: '10', filters: [],
  brand: 'la-marzocco', equipmentType: 'espresso-machine',
  translations: [{ locale: 'ru', name: 'Example', notes: '', size: '', description: 'Searchable text', category: 'Machine', statusLabel: 'In stock' }],
  details: [], features: [], images: [],
};
for (const kind of ['coffee', 'equipment']) {
  const prefix = kind === 'coffee' ? 'Coffee' : 'Equipment';
  const bySlug = kind === 'coffee' ? 'getCoffeeCatalogItemBySlug' : 'getEquipmentItemBySlug';
  test(`${kind}: list SQL joins translations without galleries or characteristics`, () => {
    const { api } = setup(kind);
    const sql = sqlDb.query.products.findMany(api[`${kind}CardQuery`]).toSQL();
    assert.match(sql.sql, /join lateral/i);
    assert.ok(sql.sql.includes('product_translations'));
    for (const table of ['product_details', 'product_features', 'product_images']) assert.ok(!sql.sql.includes(table));
    assert.ok(sql.params.includes(kind));
    assert.ok(sql.params.includes(true));
  });
  test(`${kind}: one list query returns only card fields`, async () => {
    const { api, queries } = setup(kind, row);
    const items = await api[`get${prefix}CatalogItems`]();
    assert.equal(queries.length, 1);
    assert.equal(items.length, 1);
    assert.ok(!('images' in items[0]));
    assert.ok(!('details' in items[0].translations.ru));
    if (kind === 'equipment') assert.equal(items[0].translations.ru.description, 'Searchable text');
  });
  test(`${kind}: deleting all characteristics does not resurrect static data`, async () => {
    const { api, queries } = setup(kind, row);
    const item = await api[bySlug](row.slug);
    assert.equal(item.translations.ru.details.length, 0);
    if (kind === 'equipment') {
      assert.equal(item.translations.ru.features.length, 0);
      assert.equal(item.translations.ru.specifications.length, 0);
    }
    const sql = sqlDb.query.products.findFirst(queries[0]).toSQL();
    assert.ok(sql.params.includes(row.slug));
    assert.ok(sql.params.includes(true));
    assert.match(sql.sql, /join lateral/i);
  });
  test(`${kind}: database failures propagate; only a missing row returns null`, async () => {
    const error = new Error('Database unavailable');
    const { api } = setup(kind, undefined, error);
    await assert.rejects(api[`get${prefix}CatalogItems`](), error);
    await assert.rejects(api[bySlug]('missing'), error);
    assert.equal(await setup(kind).api[bySlug]('missing'), null);
  });
  test(`${kind}: preview bypasses cache and publication filter; public caches share invalidation tag`, async () => {
    const { api, queries, caches } = setup(kind, row);
    await api[`get${prefix}PreviewItem`](row.slug);
    const sql = sqlDb.query.products.findFirst(queries[0]).toSQL();
    assert.ok(sql.params.includes(row.slug));
    assert.ok(!sql.params.includes(true));
    assert.equal(caches.length, 3);
    for (const entry of caches) assert.ok(entry.options.tags.includes(`${kind}-catalog`));
  });
}

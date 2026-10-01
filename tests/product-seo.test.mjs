import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as orm from 'drizzle-orm';
import * as pg from 'drizzle-orm/pg-core';
import { drizzle } from 'drizzle-orm/postgres-js';

function load(path, modules = {}, extra = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, URL, require: (name) => { assert.ok(name in modules, name); return modules[name]; }, ...extra });
  return exports;
}
const env = { SITE_URL: 'https://shop.example', NODE_ENV: 'production' };
const site = load('lib/site-url.ts', {}, { process: { env } });
const seo = load('lib/product-seo.ts', { './site-url': site });
const input = { kind: 'coffee', slug: 'african-profile', name: 'African Profile', description: 'Шоколад и ягоды.', image: '/coffee.webp', language: 'ru' };

test('product metadata contains its own content, canonical and absolute social image', () => {
  const meta = seo.buildProductMetadata(input);
  assert.equal(meta.title, 'African Profile — Кофе | Sketo');
  assert.equal(meta.description, input.description);
  assert.equal(meta.alternates.canonical, 'https://shop.example/catalog/african-profile');
  assert.equal(meta.openGraph.url, meta.alternates.canonical);
  assert.equal(meta.openGraph.images[0].url, 'https://shop.example/coffee.webp');
  assert.equal(meta.twitter.card, 'summary_large_image');
});

test('equipment canonical uses only /equipment and respects locale and SEO overrides', () => {
  const meta = seo.buildProductMetadata({ ...input, kind: 'equipment', language: 'kz', seoTitle: 'Арнайы атау', seoDescription: 'Арнайы сипаттама' });
  assert.equal(meta.title, 'Арнайы атау');
  assert.equal(meta.description, 'Арнайы сипаттама');
  assert.equal(meta.openGraph.locale, 'kk_KZ');
  assert.equal(meta.alternates.canonical, 'https://shop.example/equipment/african-profile');
});

test('empty overrides fall back, descriptions are bounded and placeholders are not shared', () => {
  const meta = seo.buildProductMetadata({ ...input, seoTitle: '  ', seoDescription: ' ', description: '<b>Текст</b> '.repeat(100), image: 'data:image/svg+xml,placeholder' });
  assert.equal(meta.title, 'African Profile — Кофе | Sketo');
  assert.ok(meta.description.length <= 180);
  assert.ok(!meta.description.includes('<'));
  assert.equal(meta.openGraph.images.length, 0);
  assert.equal(meta.twitter.card, 'summary');
  assert.equal(seo.seoImageUrl('javascript:alert(1)'), undefined);
});

test('structured data uses visible text and never invents offers, ratings or reviews', () => {
  const data = seo.buildProductStructuredData({ ...input, seoDescription: 'Other SEO copy' });
  const product = data['@graph'][0];
  assert.equal(product.description, input.description);
  assert.equal(product.name, input.name);
  assert.equal(product.offers, undefined);
  assert.equal(product.aggregateRating, undefined);
  const crumbs = data['@graph'][1].itemListElement;
  assert.equal(crumbs[1].item, 'https://shop.example/catalog');
  assert.equal(crumbs[2].item, product.url);
});

test('JSON-LD cannot break out of its script tag', () => {
  const name = '</script><script>alert(1)</script>';
  const serialized = seo.serializeStructuredData({ name });
  assert.ok(!serialized.includes('<'));
  assert.equal(JSON.parse(serialized).name, name);
});

test('site origin cannot come from an unsafe or incomplete production configuration', () => {
  for (const value of ['', 'javascript:alert(1)', 'https://user:password@example.com', 'https://example.com/path', 'https://example.com?x=1']) {
    env.SITE_URL = value;
    assert.throws(() => site.getSiteUrl());
  }
  env.SITE_URL = 'https://shop.example';
  assert.equal(site.publicProductPath('equipment', 'model?bad'), '/equipment/model%3Fbad');
});

const schema = load('lib/db/schema.ts', { 'drizzle-orm': orm, 'drizzle-orm/pg-core': pg });
test('sitemap queries only published products and uses catalog invalidation tags', async () => {
  let query, cacheOptions;
  const sqlDb = drizzle.mock({ schema });
  const updatedAt = new Date('2026-10-01T00:00:00Z');
  const { default: sitemap } = load('app/sitemap.ts', {
    'drizzle-orm': orm, '@/lib/db/schema': schema, '@/lib/site-url': site,
    'next/cache': { unstable_cache: (fn, key, options) => { cacheOptions = options; return fn; } },
    '@/lib/db': { db: { select: (fields) => ({ from: (table) => ({ where: async (condition) => {
      query = sqlDb.select(fields).from(table).where(condition).toSQL();
      return [{ slug: 'coffee', type: 'coffee', updatedAt }, { slug: 'machine', type: 'equipment', updatedAt }];
    } }) }) } },
  });
  const entries = await sitemap();
  assert.ok(query.params.includes(true));
  assert.match(query.sql, /is_published/);
  assert.ok(cacheOptions.tags.includes('coffee-catalog'));
  assert.ok(cacheOptions.tags.includes('equipment-catalog'));
  assert.ok(entries.some((entry) => entry.url === 'https://shop.example/equipment/machine' && entry.lastModified === updatedAt));
  assert.ok(!entries.some((entry) => /staff|login|catalog\/equipment/.test(entry.url)));
});

test('old equipment URLs are permanently redirected to the canonical route', async () => {
  const config = load('next.config.ts', {}, { __dirname: '/test' }).default;
  const redirects = await config.redirects();
  assert.equal(redirects[0].source, '/catalog/equipment/:path*');
  assert.equal(redirects[0].destination, '/equipment/:path*');
  assert.equal(redirects[0].permanent, true);
});

for (const kind of ['coffee', 'equipment']) test(`${kind}: missing/unpublished product metadata returns notFound`, async () => {
  const notFound = new Error('404');
  const path = kind === 'coffee' ? 'app/catalog/[slug]/page.tsx' : 'app/catalog/equipment/[slug]/page.tsx';
  const source = readFileSync(path, 'utf8');
  const modules = Object.fromEntries([...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => [m[1], {}]));
  modules['react/jsx-runtime'] = {};
  modules['next/navigation'] = { notFound: () => { throw notFound; } };
  modules[kind === 'coffee' ? '../../components/getInitialLanguage' : '../../../components/getInitialLanguage'] = { getInitialLanguage: async () => 'ru' };
  modules[kind === 'coffee' ? '../catalog-db' : '../equipment-db'] = { getCoffeeCatalogItemBySlug: async () => null, getEquipmentItemBySlug: async () => null };
  await assert.rejects(load(path, modules).generateMetadata({ params: Promise.resolve({ slug: 'hidden' }) }), (error) => error === notFound);
});

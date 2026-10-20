import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

function load(path, modules = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, console, require: name => { assert.ok(name in modules, name); return modules[name]; } });
  return exports;
}
const model = load('app/components/home-shelves-model.ts');
test('preferred homepage product is moved first without dropping catalogue items', () => {
  const items = [{ slug: 'first' }, { slug: 'colombia-jefferson-castano-250g' }, { slug: 'last' }];
  const selected = model.prioritizeShelfItem(items, item => item.slug === 'colombia-jefferson-castano-250g');
  assert.equal(selected.map(item => item.slug).join(), 'colombia-jefferson-castano-250g,first,last');
  assert.equal(model.prioritizeShelfItem(items, item => item.slug === 'missing'), items);
});
test('crystalline tasting cup can be selected as the homepage accessory', () => {
  const items = [{ slug: 'muvna-tasting-cup' }, { slug: 'muvna-ti-art-600-purple' }, { slug: 'muvna-tasting-cup-crystalline' }];
  const selected = model.prioritizeShelfItem(items, item => item.slug === 'muvna-tasting-cup-crystalline');
  assert.equal(selected[0].slug, 'muvna-tasting-cup-crystalline');
});
test('shelves select two real images, favour different types and keep editorial order', () => {
  const items = [{ id: 0, image: '' }, { id: 1, image: '/1', type: 'machine' }, { id: 2, image: '/2', type: 'machine' }, { id: 3, image: '/3', type: 'grinder' }];
  const select = items => model.selectShelfItems(items, item => item.image, item => item.type);
  assert.equal(select(items).map(item => item.id).join(), '1,3');
  assert.equal(select(items.slice(0, 3)).map(item => item.id).join(), '1,2');
  assert.equal(select(items.slice(0, 2)).length, 1);
  assert.equal(select([]).length, 0);
  assert.equal(items.length, 4);
});
const View = load('app/components/HomeProductShelves.tsx', {
  'react/jsx-runtime': jsx,
  'next/link': { default: ({ children, ...props }) => jsx.jsx('a', { ...props, children }) },
  'next/image': { default: ({ fill, ...props }) => jsx.jsx('img', props) },
  './usePersistentLanguage': { default: language => [language] },
  './home-product-shelves.module.css': { default: {} },
}).default;
test('all languages render three catalogue links and working product links', () => {
  for (const language of ['ru', 'en', 'kz']) {
    const product = { href: '/accessories/grinder', image: '/grinder.png', content: Object.fromEntries(['ru', 'en', 'kz'].map(locale => [locale, { name: `name-${locale}`, detail: 'detail', price: '1 000 ₸' }])) };
    const html = renderToStaticMarkup(jsx.jsx(View, { initialLanguage: language, shelves: [{ kind: 'accessories', products: [product] }] }));
    for (const href of ['/catalog', '/equipment', '/accessories', product.href]) assert.ok(html.includes(`href="${href}"`));
    assert.ok(html.includes(`name-${language}`));
    assert.ok(!html.includes('1 000 ₸'));
  }
});
test('loading and unavailable categories retain the three catalogue exits', () => {
  for (const loading of [true, false]) {
    const html = renderToStaticMarkup(jsx.jsx(View, { initialLanguage: 'ru', loading }));
    assert.equal((html.match(/<h3/g) ?? []).length, loading ? 0 : 3);
    assert.ok(html.includes(`aria-busy="${loading}"`));
    assert.equal((html.match(/<a /g) ?? []).length, 3);
  }
});
test('mixed showcase renders one item per category with equipment first and no tabs', () => {
  const shelves = ['coffee', 'equipment', 'accessories'].map(kind => ({ kind, products: [0, 1].map(index => ({
    href: `/${kind}/item-${index}`, image: `/${kind}.png`,
    content: Object.fromEntries(['ru', 'en', 'kz'].map(locale => [locale, { name: kind, detail: '', price: '1 000 ₸' }])),
  })) }));
  const html = renderToStaticMarkup(jsx.jsx(View, { initialLanguage: 'ru', shelves }));
  assert.equal((html.match(/<h3/g) ?? []).length, 3);
  assert.ok(!html.includes('item-1'));
  assert.ok(!html.includes('role="tab"'));
  assert.ok(html.indexOf('href="/equipment/item-0"') < html.indexOf('href="/coffee/item-0"'));
});

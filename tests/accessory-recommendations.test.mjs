import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

function load(path, modules = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, Intl, require: name => { assert.ok(name in modules, name); return modules[name]; } });
  return exports;
}
const model = load('app/accessories/model.ts');
const { recommendAccessories } = load('app/accessories/recommendations.ts', { './model': model });
function product(id, category, attributes = {}) {
  return { id, slug: id, name: id, brand: 'muvna', category, attributes, translations: [],
    variants: [{ id: `${id}-v`, sku: id, color: 'Black', hex: '#000000', price: '1000', currency: 'KZT', availability: 'in_stock' }],
    images: [{ id: `${id}-img`, url: '/image.jpg', alt: '', variantId: null }],
  };
}
const flatten = result => Object.values(result).flat().map(entry => entry.kind === 'coffee' ? entry.coffee.slug : entry.item.id);
function coffee(slug, methodText = '') {
  return { slug, methodText, image: '/coffee.png', price: '5 000 KZT', filters: [],
    translations: Object.fromEntries(['ru', 'en', 'kz'].map(locale => [locale, { name: slug, size: '250 g', notes: '', status: 'In stock' }])) };
}
test('fills all stages to three with available inventory, reserves coffee and varies across products', () => {
  const catalog = ['scales', 'storage', 'grinders', 'kettles', 'drippers', 'drinkware', 'serving', 'cupping'].flatMap(category =>
    Array.from({ length: 8 }, (_, i) => product(`${category}-${i}`, category, category === 'grinders' ? { brewing_method: 'Pour-over' } : {})));
  const lots = Array.from({ length: 6 }, (_, i) => coffee(`coffee-${i}`));
  const signatures = new Set();
  for (let i = 0; i < 8; i++) {
    const current = product(`current-${i}`, 'coffee-makers', { brewing_method: 'Pour-over' });
    const result = recommendAccessories(current, catalog, lots);
    for (const stage of ['prep', 'brew', 'serve']) {
      assert.equal(result[stage].length, 3);
      assert.equal(new Set(flatten({ [stage]: result[stage] })).size, 3);
      assert.equal(new Set(result[stage].map(r => r.kind === 'coffee' ? 'coffee' : r.item.category)).size, 3);
    }
    assert.equal(result.brew[0].kind, 'coffee');
    assert.equal(flatten(result).join(), flatten(recommendAccessories(current, [...catalog].reverse(), [...lots].reverse())).join());
    signatures.add(flatten(result).join());
  }
  assert.ok(signatures.size >= 6);
});
test('coffee honours explicit method and never infers brew suitability from microlot/profile labels', () => {
  const lots = [coffee('espresso', 'Espresso'), coffee('filter', 'Filter'), coffee('unknown')];
  const result = recommendAccessories(product('tamper', 'tampers'), [], lots);
  assert.equal(result.brew.length, 1);
  assert.equal(result.brew[0].coffee.slug, 'espresso');
  assert.ok(!flatten(result).includes('filter'));
  const unknown = recommendAccessories(product('tamper', 'tampers'), [], [coffee('unknown')]);
  assert.match(unknown.brew[0].reason[1], /Explore/);
});
test('fallback never repeats a type, even when only one type is available or it matches the viewed item', () => {
  const current = product('current', 'kettles');
  const catalog = ['scales', 'kettles', 'drinkware'].flatMap(category =>
    Array.from({ length: 5 }, (_, i) => product(`${category}-${i}`, category)));
  const result = recommendAccessories(current, catalog, [coffee('one'), coffee('two'), coffee('three')]);
  assert.equal(result.prep.length, 1);
  assert.equal(result.brew.length, 2);
  assert.equal(result.serve.length, 1);
  for (const entries of Object.values(result)) {
    const types = entries.map(r => r.kind === 'coffee' ? 'coffee' : r.item.category);
    assert.equal(new Set(types).size, types.length);
  }
});

test('excludes self, unavailable items and duplicates; permits alternatives and missing-photo fallback', () => {
  const current = product('kettle', 'kettles');
  const scale = product('scale', 'scales');
  const out = product('out', 'storage'); out.variants[0].availability = 'out_of_stock';
  const noPhoto = product('no-photo', 'drinkware'); noPhoto.images = [];
  const result = recommendAccessories(current, [current, product('other-kettle', 'kettles'), scale, scale, out, noPhoto]);
  assert.equal(flatten(result).sort().join(), 'no-photo,other-kettle,scale');
  assert.match(result.brew[0].reason[1], /Another option/);
});
test('espresso excludes pour-over equipment and all unverified fitted parts even with equal diameters', () => {
  const current = product('machine', 'coffee-makers', { brewing_method: { ru: 'Эспрессо' }, diameter_mm: 58 });
  const candidates = ['kettles', 'drippers', 'baskets', 'filters', 'tampers', 'distributors', 'dosing'].map(c => product(c, c, { diameter_mm: 58 }));
  assert.equal(flatten(recommendAccessories(current, candidates)).length, 0);
});
test('grinder selection allows unknown method, respects explicit mismatch and excludes bundled grinder', () => {
  const grinder = product('grinder', 'grinders', { brewing_method: { _type: 'localized-attribute', value: { en: 'Pour-over' } } });
  assert.ok(flatten(recommendAccessories(product('kettle', 'kettles'), [grinder])).includes('grinder'));
  assert.equal(flatten(recommendAccessories(product('set', 'sets', { brewing_method: 'Pour-over', included_grinder: 'GM1' }), [grinder])).length, 0);
  assert.equal(flatten(recommendAccessories(product('cup', 'drinkware'), [grinder])).join(), 'grinder');
  assert.equal(flatten(recommendAccessories(product('tamper', 'tampers'), [grinder])).length, 0);
});
test('diversity and stable tie-breaks keep one item per category independent of input order', () => {
  const catalog = [product('z', 'scales'), product('a', 'scales'), product('storage', 'storage'), product('dripper', 'drippers')];
  const current = product('kettle', 'kettles');
  const first = recommendAccessories(current, catalog);
  assert.equal(flatten(first).join(), flatten(recommendAccessories(current, [...catalog].reverse())).join());
  assert.equal(first.prep.length, 2);
  assert.equal(new Set(first.prep.slice(0, 2).map(r => r.item.category)).size, 2);
  assert.equal(first.brew[0].item.id, 'dripper');
});
test('unknown method permits standalone brewing equipment; empty inventory stays empty', () => {
  const catalog = [product('kettle', 'kettles'), product('dripper', 'drippers'), product('cup', 'drinkware'), product('scale', 'scales')];
  assert.equal(flatten(recommendAccessories(product('unknown', 'coffee-makers'), catalog)).sort().join(), 'cup,dripper,kettle,scale');
  assert.equal(flatten(recommendAccessories(product('gift', 'gifts'), catalog)).sort().join(), 'cup,dripper,kettle,scale');
  assert.equal(flatten(recommendAccessories(product('unknown', 'coffee-makers'), [])).length, 0);
});
test('cups, stands, towels, trays and spoons can receive grinders without an explicit method', () => {
  for (const [name, category] of [['Cup', 'drinkware'], ['Stand', 'serving'], ['Towel', 'cleaning'], ['Tray', 'serving'], ['Spoon', 'cupping']]) {
    const result = recommendAccessories(product(name, category), [product('grinder', 'grinders')]);
    assert.equal(result.prep[0]?.item.id, 'grinder', name);
  }
});
test('prep broadens to towels, flat mats, standalone dosing cups and freehand WDT, not fitted versions', () => {
  const catalog = [product('Barista towel', 'cleaning'), product('Silicone mat', 'tamping-stations'),
    product('Dosing cup', 'dosing'), product('Needle WDT', 'distributors'), product('Grinder', 'grinders')];
  for (const candidate of catalog) {
    assert.equal(flatten(recommendAccessories(product('cup', 'drinkware'), [candidate])).join(), candidate.id);
  }
  const fitted = [product('Dosing ring', 'dosing'), product('WDT 58 mm', 'distributors'),
    product('Rotary WDT', 'distributors'), product('Station', 'tamping-stations'), product('Silicone mat', 'tamping-stations', { diameter_mm: 58 })];
  assert.equal(flatten(recommendAccessories(product('cup', 'drinkware'), fitted)).length, 0);
  const result = recommendAccessories(product('cup', 'drinkware'), catalog);
  assert.equal(result.prep.length, 3);
  assert.equal(new Set(result.prep.map(r => r.item.category)).size, 3);
});
test('set contents suppress included tools and unavailable image bindings are excluded', () => {
  const current = product('set', 'sets', { set_contents: { en: 'Scales and kettle' }, brewing_method: 'Pour-over' });
  const hidden = product('hidden', 'storage'); hidden.images[0].variantId = 'unavailable';
  const result = recommendAccessories(current, [product('scale', 'scales'), product('kettle', 'kettles'), hidden]);
  assert.equal(flatten(result).join(), 'hidden');
  assert.equal(result.prep[0].item.images.length, 0);
});
test('workflow renders inline buttons, reasons and product links in all languages, not collection links', () => {
  const Workflow = load('app/accessories/AccessoryWorkflow.tsx', {
    react: React, 'react/jsx-runtime': jsx, './model': model,
    'next/link': { default: props => React.createElement('a', props) },
    '../components/CatalogImage': { default: () => null },
    './accessories.module.css': { default: {} },
  }).default;
  const recommendations = recommendAccessories(product('kettle', 'kettles'), [product('scale', 'scales')]);
  for (const language of ['ru', 'en', 'kz']) {
    const html = renderToStaticMarkup(React.createElement(Workflow, { recommendations, language }));
    assert.equal((html.match(/<button/g) || []).length, 3);
    assert.ok(html.includes('/accessories/scale'));
    assert.ok(!html.includes('/accessories?stage='));
    assert.ok(!html.includes('Complete your setup'));
    assert.ok(html.includes('aria-live="polite"'));
    assert.equal((html.match(/data-active="true"/g) || []).length, 1);
    assert.equal((html.match(/data-active="false"/g) || []).length, 2);
    assert.equal((html.match(/inert=""/g) || []).length, 2);
  }
  assert.equal(renderToStaticMarkup(React.createElement(Workflow, { recommendations: { prep: [], brew: [], serve: [] }, language: 'en' })), '');
});

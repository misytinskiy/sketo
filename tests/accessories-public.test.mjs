import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import { sql } from 'drizzle-orm';
import { PgDialect } from 'drizzle-orm/pg-core';
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
test('catalog grouping keeps categories together and preserves product order', () => {
  const products = [
    { id: 'scale-1', category: 'scales' },
    { id: 'gift-1', category: 'gifts' },
    { id: 'scale-2', category: 'scales' },
    { id: 'grinder-1', category: 'grinders' },
    { id: 'gift-2', category: 'gifts' },
  ];
  const groups = model.groupAccessoriesByCategory(products);
  assert.equal(groups.map(group => group.category).join(), 'scales,gifts,grinders');
  assert.equal(groups[0].products.map(product => product.id).join(), 'scale-1,scale-2');
  assert.equal(groups[1].products.map(product => product.id).join(), 'gift-1,gift-2');
  const expanded = groups.flatMap(group => group.products);
  assert.equal(expanded.slice(0, 3).map(product => product.id).join(), 'scale-1,scale-2,gift-1');
});
const item = {
  id: 'one', slug: 'kettle', name: 'Kettle', brand: 'muvna', category: 'kettles', attributes: { volume_ml: 600, foldable_handle: true },
  translations: [{ locale: 'ru', name: 'Чайник', description: 'Для кофе' }, { locale: 'en', name: 'Kettle', description: '' }],
  variants: [{ id: 'black', sku: 'BK1', color: 'Чёрный', hex: '#000000', price: '12000', currency: 'KZT', availability: 'in_stock' },
    { id: 'white', sku: 'BK2', color: 'Белый', hex: '#ffffff', price: '12000', currency: 'KZT', availability: 'out_of_stock' }],
  images: [{ id: 'a', url: '/shared.jpg', variantId: null }, { id: 'b', url: '/black.jpg', variantId: 'black' }, { id: 'c', url: '/white.jpg', variantId: 'white' }],
};
test('SKU search supports every variant, case, spacing and hyphens in every language', () => {
  for (const language of ['ru', 'en', 'kz']) {
    for (const query of ['BK1', 'bk2', ' BK 1 ', 'bk-2']) {
      assert.equal(model.matchesAccessorySearch(item, query, language), true);
    }
    assert.equal(model.matchesAccessorySearch(item, 'BK999', language), false);
    assert.equal(model.matchesAccessorySearch(item, '---', language), false);
  }
  assert.equal(model.matchesAccessorySearch(item, 'чайник', 'ru'), true);
  assert.equal(model.matchesAccessorySearch(item, '', 'en'), true);
  const duplicate = { ...item, variants: [...item.variants, { ...item.variants[0], sku: ' BK1 ' }] };
  assert.equal(model.accessorySkus(duplicate).join(', '), 'BK1, BK2');
});
test('volume SKUs follow the colour, are searchable, and unavailable combinations are excluded', () => {
  const sample = { ...item, volumes: [
    { id: '250', value: '250', unit: 'г', price: '6440', currency: 'KZT', skuByVariant: { black: 'GC2299', white: 'GC2314' } },
    { id: '750', value: '750', unit: 'г', price: '8050', currency: 'KZT', skuByVariant: { black: 'GC2301' } },
  ] };
  assert.equal(model.accessorySku(sample.variants[0], sample.volumes[1]), 'GC2301');
  assert.equal(model.accessorySku(sample.variants[1], sample.volumes[1]), '');
  assert.equal(model.accessoryVolumes(sample, 'white').map(v => v.id).join(), '250');
  assert.equal(model.accessoryVolumes(sample, 'black').length, 2);
  assert.equal(model.matchesAccessorySearch(sample, 'gc 2301', 'ru'), true);
  assert.equal(model.accessorySkus(sample).join(), 'GC2299,GC2314,GC2301');
  assert.equal(model.accessorySku({ ...item.variants[0], sku: 'ACC-c620f4b3-2ba8-4d92-a0f4-e34c029815ea' }), '');
});
test('gallery intersects colour and volume bindings while retaining shared photos', () => {
  const sample = { ...item, images: [...item.images,
    { id: 'd', url: '/450.jpg', variantId: null, volumeId: '450' },
    { id: 'e', url: '/260-black.jpg', variantId: 'black', volumeId: '260' },
  ] };
  assert.equal(model.variantImages(sample, 'black', '450').map(i => i.url).join(), '/black.jpg,/shared.jpg,/450.jpg');
  const other = model.variantImages(sample, 'white', '260').map(i => i.url);
  assert.ok(!other.includes('/450.jpg'));
  assert.ok(!other.includes('/260-black.jpg'));
  assert.ok(other.includes('/shared.jpg'));
});
test('translations fall back per field and attributes have readable units', () => {
  assert.equal(model.accessoryContent(item, 'en').name, 'Kettle');
  assert.equal(model.accessoryContent(item, 'en').description, 'Для кофе');
  assert.equal(model.accessoryContent(item, 'kz').name, 'Чайник');
  assert.equal(model.attributeRows(item, 'ru')[0].label, 'Объём, мл');
  assert.equal(model.attributeRows(item, 'en')[1].value, 'Yes');
});
test('selected colour gets its photos first, never the other colour', () => {
  assert.equal(model.variantImages(item, 'black').map(i => i.url).join(), '/black.jpg,/shared.jpg');
  assert.equal(model.variantImages({ ...item, images: [item.images[2]] }, 'black').length, 0);
});
test('localized attributes render per language with fallback and preserve scalar false/zero', () => {
  const attributes = { material: { ru: 'Сталь', en: 'Steel', kz: 'Болат' },
    purpose: { ru: 'Для кофе', en: ' ' }, unknown: { nested: true }, array: ['skip'],
    timer: false, capacity_g: 0, base_material: 'walnut' };
  const en = model.attributeRows({ ...item, attributes }, 'en');
  assert.equal(en.length, 5);
  assert.equal(en[0].value, 'Steel');
  assert.equal(en[1].value, 'Для кофе');
  assert.equal(en[2].value, 'No');
  assert.equal(en[3].value, '0');
  assert.equal(en[4].value, 'Walnut wood');
  assert.equal(model.attributeRows({ ...item, attributes }, 'kz')[0].value, 'Болат');
});
test('retail display handles equal, different, unknown prices and mixed currencies', () => {
  assert.doesNotMatch(model.catalogPrice(item, 'en'), /^from/);
  assert.match(model.catalogPrice({ ...item, variants: [item.variants[0], { ...item.variants[1], price: '15000' }] }, 'en'), /^from/);
  assert.equal(model.catalogPrice({ ...item, variants: [{ ...item.variants[0], price: null }] }, 'en'), 'Price on request');
  assert.equal(model.catalogPrice({ ...item, variants: [item.variants[0], { ...item.variants[1], currency: 'USD' }] }, 'en'), 'Price on request');
});
test('all imported categories have labels and belong to a workflow stage', () => {
  const products = JSON.parse(readFileSync('supabase/imports/20261012_muvna_catalog.json', 'utf8'));
  for (const p of products) {
    for (const lang of ['ru', 'en', 'kz']) assert.notEqual(model.categoryLabel(p.category, lang), p.category);
    assert.ok(['prep', 'brew', 'serve'].some(stage => model.matchesStage(p.category, stage)), p.category);
  }
  assert.equal(model.isStage('unknown'), false);
});
test('public SQL is read-only, parameterised and explicitly filters drafts, inactive variants and unapproved photos', async () => {
  let query;
  const data = load('app/accessories/data.ts', { 'next/cache': { unstable_cache: (fn, key, options) => { assert.equal(options.revalidate, 300); assert.ok(options.tags.includes('accessories-catalog')); return fn; } }, 'server-only': {}, react: { cache: f => f }, 'drizzle-orm': { sql }, '@/lib/db/bounded': { withBoundedDatabase: (_lane, run) => run({ execute: async q => { query = new PgDialect().sqlToQuery(q); return []; } }) } });
  assert.equal(await data.getAccessory("x' OR true --"), null);
  assert.ok(query.params.includes("x' OR true --"));
  assert.doesNotMatch(query.sql, /x' OR true/);
  assert.match(query.sql, /p.editorial_state='published'/);
  assert.match(query.sql, /v.product_id=p.id AND v.is_active/);
  assert.match(query.sql, /i.is_approved/);
  assert.match(query.sql, /'price',v.retail_price::text/);
  assert.doesNotMatch(query.sql, /price_verified|inventory_verified|stock_quantity/);
  assert.equal((query.sql.match(/to_jsonb\(v\)->>'availability'='in_stock'/g) ?? []).length, 3, 'Available variants, colour photos and product visibility use the same stock rule');
  assert.doesNotMatch(query.sql, /\b(INSERT|UPDATE|DELETE|DROP|TRUNCATE)\b/i);
  assert.doesNotMatch(query.sql, /jsonb_build_object\([^)]*'stock_quantity'/);
});
test('accessory WhatsApp order includes exact variant SKU, colour, price and page', () => {
  const order = load('lib/whatsapp-order.ts');
  const message = new URL(order.buildWhatsAppOrderUrl({ kind: 'accessory', language: 'ru', name: 'Чайник', slug: 'BK2', color: 'Белый', price: '12 000 ₸', productUrl: 'https://example.com/accessories/kettle' })).searchParams.get('text');
  for (const value of ['аксессуар', 'BK2', 'Белый', '12 000 ₸', '/accessories/kettle']) assert.ok(message.includes(value));
  assert.ok(!message.includes('оборудование'));
});
test('product page renders inline workflow and selected variant', () => {
  const styles = { default: new Proxy({}, { get: (_target, key) => String(key) }) };
  const Page = load('app/accessories/AccessoryPageClient.tsx', {
    'react/jsx-runtime': jsx, react: React,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    '../components/Footer': { default: () => null }, '../components/LanguageSwitch': { default: () => null },
    '../components/usePersistentLanguage': { default: language => [language, () => {}] },
    '../components/ProductOrderButton': { default: () => React.createElement('a', { href: '#order' }, 'Order') },
    '../catalog/equipment/[slug]/EquipmentMediaGallery': { default: ({ images }) => React.createElement('div', null, images.join(',')) },
    './AccessoryWorkflow': { default: () => React.createElement('div', { 'data-workflow': true }) }, './model': model,
    '../catalog/equipment/[slug]/equipment-item.module.css': styles, './accessories.module.css': styles,
  }).default;
  for (const language of ['ru', 'en', 'kz']) {
    const html = renderToStaticMarkup(React.createElement(Page, { item, recommendations: { prep: [], brew: [], serve: [] }, initialLanguage: language, productUrl: 'https://example.com/accessories/kettle' }));
    assert.ok(!html.includes('SKU / BK1'));
    assert.ok(html.includes('/black.jpg,/shared.jpg'));
    assert.ok(!html.includes('/white.jpg'));
    assert.ok(html.includes('data-workflow'));
    assert.ok(!html.includes('Complete your setup'));
    assert.ok(!html.includes('/accessories?stage='));
    assert.ok(html.includes('aria-pressed="true"'));
    assert.ok(html.includes('priceLine'));
    assert.ok(html.includes(language === 'en' ? 'Price / Status' : language === 'kz' ? 'Баға / Мәртебе' : 'Цена / Наличие'));
    const withVolumes = { ...item, volumes: ['260', '450'].map(value => ({ id: value, value, unit: 'мл', price: '100', currency: 'KZT' })) };
    const volumeHtml = renderToStaticMarkup(React.createElement(Page, { item: withVolumes, recommendations: { prep: [], brew: [], serve: [] }, initialLanguage: language, productUrl: 'https://example.com/accessories/kettle' }));
    assert.ok(volumeHtml.includes(language === 'en' ? '260 ml' : '260 мл'));
    assert.ok(volumeHtml.includes(language === 'en' ? '450 ml' : '450 мл'));
    assert.ok(!volumeHtml.includes('260.00'));
  }
});
test('a single colour is not shown as a choice on cards or product pages', () => {
  const styles = { default: new Proxy({}, { get: (_target, key) => String(key) }) };
  const single = { ...item, variants: [item.variants[0]] };
  const modules = {
    'react/jsx-runtime': jsx, react: React,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    '../components/Footer': { default: () => null }, '../components/LanguageSwitch': { default: () => null },
    '../components/usePersistentLanguage': { default: language => [language, () => {}] },
    '../components/ProductOrderButton': { default: () => null },
    '../catalog/equipment/[slug]/EquipmentMediaGallery': { default: () => null }, './AccessoryWorkflow': { default: () => React.createElement('div', { 'data-workflow': true }) },
    './model': model, '../catalog/equipment/[slug]/equipment-item.module.css': styles, './accessories.module.css': styles,
  };
  const Page = load('app/accessories/AccessoryPageClient.tsx', modules).default;
  const pageHtml = renderToStaticMarkup(React.createElement(Page, { item: single, recommendations: { prep: [], brew: [], serve: [] }, initialLanguage: 'ru', productUrl: 'https://example.com/accessories/kettle' }));
  assert.ok(!pageHtml.includes('Цвет / исполнение'));
  assert.ok(!pageHtml.includes('Выберите цвет'));
  const Card = load('app/accessories/AccessoryCard.tsx', {
    'react/jsx-runtime': jsx, 'next/link': modules['next/link'], '../components/CatalogImage': { default: () => null },
    './model': model, '../catalog/equipment/equipment.module.css': styles, './accessories.module.css': styles,
  }).default;
  const cardHtml = renderToStaticMarkup(React.createElement(Card, { item: single, language: 'ru' }));
  assert.ok(!cardHtml.includes('aria-label="Цвета"'));
});

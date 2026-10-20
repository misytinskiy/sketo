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
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022, jsx: ts.JsxEmit.ReactJSX } }).outputText,
    { exports, require: (key) => { assert.ok(key in modules, key); return modules[key]; }, File, Buffer, crypto });
  return exports;
}
const model = load('app/staff/accessories/editor-model.ts');
const attributes = load('app/staff/accessories/attribute-editor.ts');
test('main image skips unavailable colours, hidden photos and removed volumes', () => {
  const variants = [{ id: 'black', active: true, availability: 'out_of_stock' }, { id: 'white', active: true, availability: 'in_stock' }];
  const photos = [
    { id: 'a', approved: true, variantId: 'black' },
    { id: 'b', approved: false, variantId: null },
    { id: 'c', approved: true, variantId: null, volumeId: 'removed' },
    { id: 'd', approved: true, variantId: 'white' },
  ];
  assert.equal(photos.find(p => model.isVisibleAccessoryImage(p, variants))?.id, 'd');
  assert.equal(model.isVisibleAccessoryImage({ approved: true, variantId: null }, variants), true);
});
test('attribute editing preserves other languages, scalars and unknown structured data', () => {
  const original = { ru: 'Ручной', en: 'Manual', kz: 'Қолмен' };
  const changed = attributes.updateAttributeTranslation(original, 'ru', 'Ручное управление');
  assert.equal(changed.ru, 'Ручное управление');
  assert.equal(changed.en, 'Manual');
  assert.equal(changed.kz, 'Қолмен');
  assert.equal(original.ru, 'Ручной');
  const values = { operation: original, count: 0, timer: false, custom: { nested: [1,2] } };
  const rows = attributes.attributeRows(values);
  assert.deepEqual(Object.fromEntries(rows.map(r => [r.key,r.value])), values);
  assert.equal(attributes.isTranslated(original), true);
  assert.equal(attributes.isTranslated(values.custom), false);
  assert.equal(rows[1].numeric, true);
});
test('free-form attribute labels preserve internal keys, values and other translations', () => {
  const rows = attributes.attributeRows({ operation: { ru: 'Ручной', en: 'Manual', kz: 'Қолмен' }, diameter_mm: 58 });
  rows[0].labels = { ru: 'Способ управления', en: 'Operation', kz: 'Басқару' };
  const stored = attributes.serializeAttributeRows(rows);
  assert.equal(stored.operation.value.en, 'Manual');
  assert.equal(stored.diameter_mm, 58);
  const restored = attributes.attributeRows(stored);
  assert.equal(restored[0].key, 'operation');
  assert.equal(restored[0].labels.ru, 'Способ управления');
  const publicModel = load('app/accessories/model.ts');
  assert.equal(publicModel.attributeRows({ attributes: stored }, 'ru')[0].label, 'Способ управления');
  assert.equal(publicModel.attributeRows({ attributes: stored }, 'en')[0].label, 'Operation');
  assert.equal(publicModel.attributeRows({ attributes: stored }, 'kz')[0].value, 'Қолмен');
});
const productId = '11111111-1111-4111-8111-111111111111';
const variantId = '22222222-2222-4222-8222-222222222222';
const imageId = '33333333-3333-4333-8333-333333333333';
const input = () => ({ id: productId, version: '2026-10-13 10:00:00+00', slug: 'muvna-test', state: 'draft', brand: 'muvna', category: 'scales', sortOrder: 0, attributes: {},
  translations: ['ru','en','kz'].map((locale) => ({ locale, name: locale === 'ru' ? 'Весы' : '', description: '' })),
  variants: [{ id: variantId, sku: 'TEST1', code: 'black', color: 'Чёрный', hex: '#000000', price: '100.50', currency: 'KZT', stock: null, priceVerified: false, inventoryVerified: false, active: true }], images: [] });
test('accessory form uses common layout and one content language; technical fields are hidden', () => {
  const css = { default: new Proxy({}, { get: (_t, key) => String(key) }) };
  const select = load('app/staff/accessories/EditorSelect.tsx', {
    react: React, 'react/jsx-runtime': jsx, '../edit/[kind]/[slug]/page.module.css': css, './editor.module.css': css,
  });
  const Form = load('app/staff/accessories/AccessoryEditorForm.tsx', {
    react: React, 'react/jsx-runtime': jsx,
    'next/link': { default: ({ children, ...props }) => React.createElement('a', props, children) },
    'next/image': { default: () => null }, './editor-actions': { saveAccessory() {} },
    './types': load('app/staff/accessories/types.ts'), './attribute-editor': attributes,
    '../../accessories/model': load('app/accessories/model.ts'),
    '../edit/[kind]/[slug]/page.module.css': css, './editor.module.css': css,
    './EditorSelect': select, './AccessoryMediaEditor': { default: () => null },
  }).default;
  const html = renderToStaticMarkup(React.createElement(Form, { initial: { ...input(), name: 'Весы', attributes: {
    operation: { ru: 'Ручной', en: 'Manual', kz: 'Қолмен' }, diameter_mm: 58,
  } } }));
  for (const text of ['heroCard', 'actionBar', 'localeTabs', 'Управление', 'Значение · RU', 'Язык содержимого', 'type="color"', 'Палитра:', 'Наличие:']) assert.ok(html.includes(text), text);
  for (const text of ['Перед публикацией', 'На проверку']) assert.equal(html.includes(text), false, text);
  for (const text of ['Значение · EN', 'Значение · KZ', 'Порядок сортировки', '>Артикул<', '>Код цвета<', '<select']) assert.ok(!html.includes(text), text);
  assert.ok(html.includes('value="Ручной"'));
  assert.ok(!html.includes('{&quot;en&quot;'));
  assert.ok(!html.includes('Аксессуары · Опубликовано'));
});
test('manual availability is validated and new hidden identifiers are stable and unique', () => {
  const p = input(); p.variants[0].sku = ''; p.variants[0].code = '';
  for (const availability of ['in_stock', 'out_of_stock']) {
    p.variants[0].availability = availability;
    const v = model.parseAccessoryInput(JSON.stringify(p)).variants[0];
    assert.equal(v.availability, availability);
    assert.equal(v.sku, `ACC-${variantId}`);
    assert.equal(v.code, `color-${variantId}`);
  }
  p.variants[0].availability = 'invalid';
  assert.throws(() => model.parseAccessoryInput(JSON.stringify(p)), /статус наличия/);
  const original = model.parseAccessoryInput(JSON.stringify(input())).variants[0];
  assert.equal(original.availability, 'in_stock');
  assert.equal(original.sku, 'TEST1'); assert.equal(original.code, 'black');
});

test('valid draft keeps exact decimal prices and ignores legacy inventory fields', () => {
  const result = model.parseAccessoryInput(JSON.stringify(input()));
  assert.equal(result.variants[0].price, '100.50');
  assert.equal('stock' in result.variants[0], false);
  assert.equal('priceVerified' in result.variants[0], false);
});
test('optional volume is validated independently of price and SKU can be omitted', () => {
  const p = input(); p.variants[0].sku = '';
  assert.equal(model.parseAccessoryInput(JSON.stringify(p)).variants[0].volumeMl, null);
  for (const [value, expected] of [['450', '450'], ['260,50', '260.5'], ['', null]]) {
    p.variants[0].volumeMl = value;
    const v = model.parseAccessoryInput(JSON.stringify(p)).variants[0];
    assert.equal(v.volumeMl, expected);
    assert.equal(v.price, '100.50');
    assert.equal(v.sku, `ACC-${variantId}`);
  }
  for (const value of ['0', '-1', '1e3', 'abc', '10000000', '1.234']) {
    p.variants[0].volumeMl = value;
    assert.throws(() => model.parseAccessoryInput(JSON.stringify(p)), /Объём/);
  }
});
test('product volumes are independent of colours and support custom units with ml default', () => {
  const p = input();
  p.volumes = [{ id: imageId, value: '0,5', price: '2500', currency: 'KZT' }];
  let result = model.parseAccessoryInput(JSON.stringify(p));
  assert.equal(result.volumes[0].unit, 'мл');
  assert.equal(result.volumes[0].value, '0.5');
  assert.equal(result.variants[0].price, '100.50');
  assert.equal(result.volumes[0].price, '2500');
  p.volumes[0].unit = 'л';
  result = model.parseAccessoryInput(JSON.stringify(p));
  assert.equal(result.volumes[0].unit, 'л');
  for (const value of ['0', '-1', 'abc']) {
    p.volumes[0].value = value;
    assert.throws(() => model.parseAccessoryInput(JSON.stringify(p)), /Объём/);
  }
  p.volumes[0].value = '450'; p.volumes[0].price = '-1';
  assert.throws(() => model.parseAccessoryInput(JSON.stringify(p)), /цену объёма/);
});
test('rejects negative prices, duplicate variants and unknown photo colours', () => {
  for (const change of [
    (p) => { p.variants[0].price = '-1'; },
    (p) => { p.variants.push({ ...p.variants[0] }); },
    (p) => { p.images.push({ id: imageId, variantId: productId, alt: '', approved: true }); },
    (p) => { p.translations[1].locale = 'ru'; },
  ]) { const p = input(); change(p); assert.throws(() => model.parseAccessoryInput(JSON.stringify(p))); }
});

function harness({ unauthorized = false, stale = false, foreignPhoto = false, duplicate = false, failAudit = false, uploads = false } = {}) {
  const writes = []; const committed = []; const storageWrites = []; const statements = []; let reads = 0;
  const dialect = new PgDialect();
  const database = {
    transaction: async (fn) => {
      const tx = {
        execute: async (query) => {
          reads++;
          const statement = dialect.sqlToQuery(query);
          statements.push(statement);
          const { sql: text } = statement;
          if (/FROM staff_members/.test(text)) return [{ id: productId }];
          if (/FROM accessory_products/.test(text)) return [{ id: productId, version: stale ? 'newer-version' : input().version }];
          if (/SELECT \* FROM accessory_variants/.test(text)) return [{ id: variantId }];
          if (/SELECT \* FROM accessory_images/.test(text)) return foreignPhoto ? [] : [{ id: imageId }];
          if (/SELECT \* FROM accessory_translations/.test(text)) return [];
          if (duplicate && /UPDATE accessory_variants/.test(text)) throw Object.assign(new Error('duplicate'), { code: '23505' });
          writes.push(text); return [];
        },
        insert: () => ({ values: async () => { if (failAudit) throw Object.assign(new Error('db unavailable'), { code: '08006' }); writes.push('AUDIT'); } }),
      };
      const result = await fn(tx);
      committed.push(...writes);
      return result;
    },
  };
  const actions = load('app/staff/accessories/editor-actions.ts', {
    'drizzle-orm': { sql }, sharp: { default: () => { if (!uploads) throw new Error('Unexpected upload'); return { rotate: () => ({ webp: () => ({ toBuffer: async () => Buffer.from('webp') }) }) }; } },
    'next/cache': { revalidatePath() {}, updateTag(tag) { assert.equal(tag, 'accessories-catalog'); assert.ok(committed.length, 'invalidate only after commit'); } }, '@/lib/db/bounded': { withBoundedDatabase: (_lane, run) => database.transaction(run) }, '@/lib/db/schema': { auditLogs: {} },
    '@/lib/staff-auth': { requireStaff: async () => { if (unauthorized) throw new Error('Unauthorised'); return { id: productId }; } },
    '@/lib/supabase/admin': { createAdminClient: () => { if (!uploads) throw new Error('Unexpected storage access'); return { storage: { from: () => ({ upload: async path => { storageWrites.push(path); return { error: null }; }, getPublicUrl: path => ({ data: { publicUrl: `https://example.com/${path}` } }) }) } }; } },
    '@/lib/supabase/media-validation': load('lib/supabase/media-validation.ts'), './editor-model': model,
    './editor-data': { getAccessoryEditor: async () => ({ ...input(), version: uploads && !committed.some(s => /UPDATE accessory_products/.test(s)) ? input().version : 'new-version' }) },
  });
  return { committed, storageWrites, statements, reads: () => reads, save: async (p = input(), files = [], primary = -1, mediaOnly = false) => { const f = new FormData(); f.set('product', JSON.stringify(p)); f.set('primaryPhoto', String(primary)); files.forEach((entry, index) => { f.append('photos', entry.file); f.set(`photoVariant:${index}`, entry.variantId ?? ''); }); return (mediaOnly ? actions.saveAccessoryMedia : actions.saveAccessory)({}, f); } };
}
test('independent media upload makes a new photo primary without saving unsaved product fields', async () => {
  const h = harness({ uploads: true });
  const p = input(); p.translations[0].name = 'UNSAVED TITLE'; p.variants[0].price = '9999';
  p.images = [{ id: imageId, variantId: null, alt: 'Existing', approved: true }];
  const file = new File([new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])], 'photo.png', { type: 'image/png' });
  assert.equal((await h.save(p, [{ file }], 0, true)).status, 'success');
  const inserted = h.statements.find(s => /INSERT INTO accessory_images/.test(s.sql));
  assert.equal(inserted.params.at(-1), 0);
  const old = h.statements.find(s => /UPDATE accessory_images/.test(s.sql));
  assert.equal(old.params[4], 1);
  assert.ok(!h.statements.some(s => s.params.includes('UNSAVED TITLE') || s.params.includes('9999')));
});
test('batch photo save preserves per-colour links and order, with automatic approval', async () => {
  const p = input(); p.state = 'published'; p.translations[0].description = 'Описание'; p.variants[0].availability = 'in_stock';
  const file = () => new File([new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])], 'photo.png', { type: 'image/png' });
  const h = harness({ uploads: true });
  const result = await h.save(p, [{ file: file(), variantId }, { file: file(), variantId: null }]);
  assert.equal(result.status, 'success', result.message);
  assert.equal(h.storageWrites.length, 2);
  const inserts = h.statements.filter(s => /INSERT INTO accessory_images/.test(s.sql));
  assert.equal(inserts.length, 2);
  assert.equal(inserts[0].params[2], variantId);
  assert.equal(inserts[1].params[2], null);
  assert.equal(inserts[0].params.at(-1), 0);
  assert.equal(inserts[1].params.at(-1), 1);
  assert.match(inserts[0].sql, /true/);
  assert.ok(h.statements.find(s => /UPDATE accessory_variants/.test(s.sql)).params.includes('in_stock'));
});
test('invalid upload batch is rejected before any storage write', async () => {
  const h = harness({ uploads: true });
  const file = new File(['invalid'], 'file.txt', { type: 'text/plain' });
  assert.equal((await h.save(input(), [{ file }])).status, 'error');
  assert.equal(h.storageWrites.length, 0);
  const valid = new File([new Uint8Array([137,80,78,71,13,10,26,10,0,0,0,0])], 'photo.png', { type: 'image/png' });
  assert.equal((await h.save(input(), [{ file: valid, variantId: imageId }])).status, 'error');
  assert.equal(h.storageWrites.length, 0);
});
test('unauthorised calls never touch the database', async () => {
  const h = harness({ unauthorized: true }); await assert.rejects(h.save(), /Unauthorised/); assert.equal(h.reads(), 0);
});
test('stale version stops before all changes', async () => {
  const h = harness({ stale: true }); const result = await h.save(); assert.equal(result.status, 'error'); assert.match(result.message, /другой сотрудник/); assert.equal(h.committed.length, 0);
});
test('foreign photo IDs and variant removal are rejected', async () => {
  const h = harness({ foreignPhoto: true }); const p = input(); p.images = [{ id: imageId, variantId: null, alt: '', approved: true }];
  assert.match((await h.save(p)).message, /не принадлежит/); assert.equal(h.committed.length, 0);
  const h2 = harness(); const p2 = input(); p2.variants[0].id = imageId;
  assert.match((await h2.save(p2)).message, /нельзя удалить/); assert.equal(h2.committed.length, 0);
});
test('photo volume belongs to the product and is persisted independently of colour', async () => {
  const p = input();
  p.volumes = [{ id: productId, value: '450', unit: 'мл', price: '100', currency: 'KZT' }];
  p.images = [{ id: imageId, variantId: null, volumeId: productId, alt: '', approved: true }];
  const h = harness();
  assert.equal((await h.save(p)).status, 'success');
  const update = h.statements.find(s => /UPDATE accessory_images/.test(s.sql));
  assert.equal(update.params[0], null);
  assert.equal(update.params[1], productId);
  p.images[0].volumeId = imageId;
  assert.throws(() => model.parseAccessoryInput(JSON.stringify(p)), /неизвестному объёму/);
});
test('explicit colour deletion is scoped and runs after image updates', async () => {
  const h = harness(); const p = input();
  p.variants[0].id = imageId;
  p.deletedVariantIds = [variantId];
  p.images = [{ id: imageId, variantId: null, alt: '', approved: false }];
  assert.equal((await h.save(p)).status, 'success');
  const deleted = h.statements.find(s => /DELETE FROM accessory_variants/.test(s.sql));
  assert.ok(deleted);
  assert.deepEqual(deleted.params, [variantId, productId]);
  assert.ok(h.committed.findIndex(s => /UPDATE accessory_images/.test(s)) < h.committed.findIndex(s => /DELETE FROM accessory_variants/.test(s)));
  assert.ok(!h.committed.some(s => /DELETE FROM accessory_images/.test(s)));
});
test('foreign deletion IDs and deleting the last colour are rejected', async () => {
  const h = harness(); const p = input(); p.deletedVariantIds = [imageId];
  assert.match((await h.save(p)).message, /не принадлежит/);
  assert.equal(h.committed.length, 0);
  p.deletedVariantIds = [variantId]; p.variants = [];
  assert.match((await h.save(p)).message, /от 1 до 100/);
  assert.equal(h.committed.length, 0);
});
test('audit failure rolls back colour deletion too', async () => {
  const h = harness({ failAudit: true }); const p = input();
  p.variants[0].id = imageId; p.deletedVariantIds = [variantId];
  assert.equal((await h.save(p)).status, 'error');
  assert.equal(h.committed.length, 0);
});
test('incomplete publication and SKU collisions cannot commit', async () => {
  const h = harness(); const p = input(); p.state = 'published';
  assert.equal((await h.save(p)).status, 'error'); assert.equal(h.committed.length, 0);
  const d = harness({ duplicate: true }); assert.match((await d.save()).message, /уже занят/); assert.equal(d.committed.length, 0);
});
test('publication does not require stock or confirmation flags and never updates legacy inventory', async () => {
  const p = input(); p.state = 'published'; p.translations[0].description = 'Описание';
  p.images = [{ id: imageId, variantId: null, alt: '', approved: true }];
  const h = harness();
  assert.equal((await h.save(p)).status, 'success');
  assert.doesNotMatch(h.committed.join('\n'), /stock_quantity|inventory_verified|price_verified|stock_recorded_at/);
  delete p.variants[0].stock;
  delete p.variants[0].priceVerified;
  delete p.variants[0].inventoryVerified;
  assert.equal((await harness().save(p)).status, 'success');
});
test('audit failure rolls back; successful save returns fresh version', async () => {
  const bad = harness({ failAudit: true }); assert.equal((await bad.save()).status, 'error'); assert.equal(bad.committed.length, 0);
  const good = harness(); const result = await good.save(); assert.equal(result.status, 'success'); assert.equal(result.product.version, 'new-version'); assert.ok(good.committed.includes('AUDIT'));
});
test('photo of an inactive colour does not satisfy publication requirements', async () => {
  const h = harness(); const p = input(); p.state = 'published'; p.translations[0].description = 'Описание';
  p.variants[0].active = false;
  p.variants.push({ ...p.variants[0], id: productId, sku: 'TEST2', code: 'white', stock: 2, priceVerified: true, inventoryVerified: true, active: true });
  p.images = [{ id: imageId, variantId, alt: '', approved: true }];
  assert.match((await h.save(p)).message, /активного цвета/); assert.equal(h.committed.length, 0);
});
test('photo of an out-of-stock colour cannot satisfy publication', async () => {
  const h = harness(); const p = input(); p.state = 'published'; p.translations[0].description = 'Описание';
  p.variants[0].availability = 'out_of_stock';
  p.variants.push({ ...p.variants[0], id: productId, sku: 'WHITE', code: 'white', availability: 'in_stock' });
  p.images = [{ id: imageId, variantId, alt: '', approved: true }];
  assert.equal((await h.save(p)).status, 'error');
  assert.equal(h.committed.length, 0);
  p.images[0].variantId = null;
  assert.equal((await harness().save(p)).status, 'success');
});

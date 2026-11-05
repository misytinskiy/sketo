import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync('app/cart/model.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
}).outputText, { exports });
const { addLine, cartKey, cartTotals, decodeCart, setQuantity, parseKztPrice, toMinorUnits } = exports;
const product = { kind: 'accessory', slug: 'cup', variantId: 'green', volumeId: '180', href: '/accessories/cup', image: '/cup.png', unitPrice: 2300000,
  content: Object.fromEntries(['ru', 'en', 'kz'].map(locale => [locale, { name: 'Cup', detail: '180 ml' }])) };

test('same selection increments quantity, colours and volumes remain separate', () => {
  let lines = addLine([], product);
  lines = addLine(lines, product);
  lines = addLine(lines, { ...product, variantId: 'white' });
  lines = addLine(lines, { ...product, volumeId: '250' });
  assert.equal(lines.length, 3);
  assert.equal(lines[0].quantity, 2);
  assert.equal(cartTotals(lines).subtotal, 9200000);
});
test('adding again refreshes product metadata and unit price', () => {
  const lines = addLine([{ ...product, quantity: 2 }], { ...product, unitPrice: 2000000 });
  assert.equal(lines[0].quantity, 3);
  assert.equal(lines[0].unitPrice, 2000000);
});
test('quantity boundaries and item limit are enforced', () => {
  const lines = [{ ...product, quantity: 99 }];
  assert.equal(addLine(lines, product)[0].quantity, 99);
  for (const value of [0, -1, 100, 1.5, NaN]) assert.equal(setQuantity(lines, cartKey(product), value), lines);
  assert.equal(setQuantity(lines, cartKey(product), 2)[0].quantity, 2);
  const full = Array.from({ length: 100 }, (_, i) => ({ ...product, slug: `cup-${i}`, quantity: 1 }));
  assert.equal(addLine(full, product), full);
});
test('unknown equipment price is flagged and never included as a free item', () => {
  const totals = cartTotals([{ ...product, quantity: 2 }, { ...product, kind: 'equipment', unitPrice: null, quantity: 1 }]);
  assert.equal(totals.count, 3);
  assert.equal(totals.subtotal, 4600000);
  assert.equal(totals.needsQuote, true);
});
test('prices retain fractional tenge and reject unsupported formats', () => {
  assert.equal(parseKztPrice('KZT 9,000'), 900000);
  assert.equal(parseKztPrice('KZT 1,234.50'), 123450);
  assert.equal(toMinorUnits('29498.00'), 2949800);
  for (const value of ['Цена по запросу', 'USD 100', 'KZT 1,23', 'KZT -10']) assert.equal(parseKztPrice(value), null);
  for (const value of ['', '-1', 'NaN', 'Infinity', null]) assert.equal(toMinorUnits(value), null);
});
test('restoring storage accepts valid rows and rejects corrupt or unsafe rows', () => {
  const line = { ...product, quantity: 2 };
  const encode = lines => JSON.stringify({ version: 1, lines });
  assert.equal(decodeCart(encode([line]))[0].quantity, 2);
  assert.equal(decodeCart('not json').length, 0);
  assert.equal(decodeCart(JSON.stringify({ version: 2, lines: [line] })).length, 0);
  for (const patch of [{ quantity: -1 }, { quantity: 100 }, { unitPrice: -100 }, { unitPrice: '100' }, { href: 'javascript:alert(1)' }, { href: '//example.com' }, { image: 'javascript:x' }, { content: {} }]) {
    assert.equal(decodeCart(encode([{ ...line, ...patch }])).length, 0);
  }
  assert.equal(decodeCart(encode([line, line])).length, 1);
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

function load(file, modules = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 },
  }).outputText, { exports, require: name => { assert.ok(name in modules, name); return modules[name]; }, ...globals });
  return exports;
}
const pricing = load('lib/equipment-price.ts');
const { parseHalykRate, isUsableRate, equipmentKztPrice, formatEquipmentPrice, RATE_MAX_AGE_MS } = pricing;
const now = Date.parse('2026-11-04T12:00:00Z');
const rate = { sell: 516.56, date: '2026-11-04', fetchedAt: now };
const row = (date, sell) => ({ date, legalPersons: { 'EUR/KZT': { buy: 504.56, sell } }, cards: { 'EUR/KZT': { sell: 512.31 } } });

test('uses newest EUR business sell quote, ignoring card and buy rates', () => {
  for (const history of [[row('2026-11-03', 513.19), row('2026-11-04', 516.56)], { older: row('2026-11-03', 513.19), latest: row('2026-11-04', 516.56) }]) {
    const value = parseHalykRate({ result: true, data: { currencyHistory: history } }, now);
    assert.equal(value.sell, 516.56);
    assert.equal(value.date, '2026-11-04');
  }
});
test('rejects error bodies, missing business rates, obsolete and future dates, invalid rates', () => {
  for (const value of [null, {}, { result: false }, ...[0, -1, Infinity, NaN, '516.56'].map(sell => ({ result: true, data: { currencyHistory: [row('2026-11-04', sell)] } }))]) {
    assert.throws(() => parseHalykRate(value, now));
  }
  for (const date of ['2026-10-28', '2026-11-05', 'invalid']) assert.throws(() => parseHalykRate({ result: true, data: { currencyHistory: [row(date, 516.56)] } }, now));
  assert.throws(() => parseHalykRate({ result: true, data: { currencyHistory: [{ date: '2026-11-04', cards: { 'EUR/KZT': { sell: 500 } } }] } }, now));
});
test('last good quote expires after 24h; weekends allowed but old bank dates rejected', () => {
  assert.equal(isUsableRate(rate, now + RATE_MAX_AGE_MS - 1), true);
  assert.equal(isUsableRate(rate, now + RATE_MAX_AGE_MS), false);
  assert.equal(isUsableRate({ ...rate, date: '2026-11-01' }, now), true);
  assert.equal(isUsableRate({ ...rate, date: '2026-10-30' }, now), false);
  assert.equal(isUsableRate({ ...rate, fetchedAt: now + 1000 }, now), false);
});
test('converts EUR and rounds upward to 1,000 KZT without increasing exact multiples', () => {
  assert.equal(equipmentKztPrice('4452', rate), 230000000);
  assert.equal(equipmentKztPrice('231.47', rate), 12000000);
  assert.equal(equipmentKztPrice('2', { ...rate, sell: 500 }), 100000);
  assert.equal(equipmentKztPrice('2', { ...rate, sell: 500.0001 }), 200000);
  assert.equal(equipmentKztPrice('2', { ...rate, sell: 499.9999 }), 100000);
  for (const eur of [null, '', '-1', 'NaN', '1.001', '0', '9999999999']) assert.equal(equipmentKztPrice(eur, rate), null);
  assert.equal(equipmentKztPrice('4452', null), null);
});
test('from-price survives localized rendering and mixed cart totals', () => {
  assert.match(formatEquipmentPrice(100000, true, 'ru'), /^от /);
  assert.match(formatEquipmentPrice(100000, true, 'en'), /^from /);
  assert.match(formatEquipmentPrice(100000, true, 'kz'), /бастап$/);
  assert.equal(formatEquipmentPrice(null, true, 'ru'), 'Цена по запросу');
  const { cartTotals } = load('app/cart/model.ts');
  const total = cartTotals([{ unitPrice: 100000, priceFrom: true, quantity: 2 }, { unitPrice: 50000, quantity: 1 }, { unitPrice: null, quantity: 1 }]);
  assert.equal(total.subtotal, 250000);
  assert.equal(total.priceFrom, true);
  assert.equal(total.needsQuote, true);
});
test('server never returns an expired cached rate, and handles an initial outage', async () => {
  for (const cached of [rate, null]) {
    const api = load('lib/halyk-rate.ts', {
      './equipment-price': { ...pricing, isUsableRate: value => isUsableRate(value, now + RATE_MAX_AGE_MS) },
      'next/cache': { unstable_cache: () => async () => { if (cached) return cached; throw new Error('Offline'); } },
    }, { console: { warn() {} } });
    assert.equal(await api.getEquipmentRate(), null);
  }
});

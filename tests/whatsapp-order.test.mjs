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
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, require: (name) => { assert.ok(name in modules, name); return modules[name]; } });
  return exports;
}
const order = load('lib/whatsapp-order.ts');
const Button = load('app/components/ProductOrderButton.tsx', {
  'react/jsx-runtime': jsx, '@/lib/whatsapp-order': order,
  './ProductOrderButton.module.css': { default: {} },
}).default;
const greetings = { ru: 'Здравствуйте!', en: 'Hello!', kz: 'Сәлеметсіз бе!' };
const props = {
  name: 'Кофе «А & Б» / Қазақстан #1', slug: 'african-profile-1-0',
  productUrl: 'https://shop.example/catalog/african-profile-1-0',
  size: '250 г', price: 'KZT 5,700',
};

for (const kind of ['coffee', 'equipment']) for (const language of ['ru', 'en', 'kz']) {
  test(`${kind}/${language}: rendered button has the right recipient and localized message`, () => {
    const productUrl = kind === 'coffee' ? props.productUrl : 'https://shop.example/equipment/linea-mini';
    const input = { ...props, kind, language, productUrl };
    const html = renderToStaticMarkup(React.createElement(Button, input));
    assert.ok(html.includes(order.orderCopy[language].button));
    assert.ok(html.includes('target="_blank"'));
    const href = html.match(/href="([^"]+)"/)[1].replaceAll('&amp;', '&').replaceAll('&#x27;', "'");
    const url = new URL(href);
    assert.equal(url.origin + url.pathname, 'https://wa.me/77473835398');
    assert.equal([...url.searchParams.keys()].join(), 'text');
    const message = url.searchParams.get('text');
    assert.ok(message.startsWith(greetings[language]));
    assert.ok(message.includes(props.name), 'Special characters survive URL encoding');
    assert.ok(message.includes(props.slug));
    assert.ok(message.includes(productUrl));
    assert.equal(message.includes(props.size), kind === 'coffee');
    assert.equal(message.includes(props.price), kind === 'coffee');
    assert.ok(message.includes('\n'));
  });
}

test('changing language or selected product regenerates the message', () => {
  const ru = order.buildWhatsAppOrderUrl({ ...props, kind: 'coffee', language: 'ru' });
  const en = order.buildWhatsAppOrderUrl({ ...props, kind: 'coffee', language: 'en', name: 'Other lot', slug: 'other-lot', productUrl: 'https://shop.example/catalog/other-lot' });
  assert.notEqual(ru, en);
  const message = new URL(en).searchParams.get('text');
  assert.ok(message.startsWith('Hello!'));
  assert.ok(message.includes('Other lot'));
  assert.ok(!message.includes(props.slug));
});

test('missing optional fields do not produce undefined text or blank price labels', () => {
  const message = new URL(order.buildWhatsAppOrderUrl({ ...props, kind: 'coffee', language: 'en', name: '', size: '', price: undefined })).searchParams.get('text');
  assert.ok(message.includes(props.slug));
  assert.ok(!/undefined|Website price:|Weight:/.test(message));
});

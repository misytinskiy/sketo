import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as React from 'react';
import * as jsx from 'react/jsx-runtime';
import { renderToStaticMarkup } from 'react-dom/server';

function load(path, modules = {}, globals = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, {
    exports, require: name => {
      assert.ok(name in modules, name);
      return modules[name];
    }, ...globals,
  });
  return exports;
}
const language = load('app/components/language.ts');
const provider = load('app/components/LanguageProvider.tsx', { react: React, 'react/jsx-runtime': jsx });
const storage = new Map();
const events = [];
const document = { cookie: '', documentElement: { lang: 'ru' } };
const hook = load('app/components/usePersistentLanguage.ts', {
  react: React, './language': language, './LanguageProvider': provider,
}, { window: {
  localStorage: { setItem: (k, v) => storage.set(k, v), getItem: k => storage.get(k) ?? null },
  dispatchEvent: event => events.push(event.type),
}, document, Event });

test('Kazakh is normalized and persisted without falling back to Russian', () => {
  assert.equal(language.normalizeLanguage('kz'), 'kz');
  assert.equal(language.getContentLanguage('kz'), 'kz');
  assert.equal(language.normalizeLanguage(null), 'ru');
  assert.equal(language.normalizeLanguage('unknown'), 'ru');
  hook.persistLanguage('kz');
  assert.equal(storage.get(language.LANGUAGE_STORAGE_KEY), 'kz');
  assert.match(document.cookie, /sketo-language=kz/);
  assert.equal(document.documentElement.lang, 'kk');
  assert.deepEqual(events, ['sketo-language-change']);
});

test('server-rendered switch enables KZ and legacy headings use cookie language', () => {
  const shared = { react: React, 'react/jsx-runtime': jsx, './usePersistentLanguage': hook };
  const Switch = load('app/components/LanguageSwitch.tsx', {
    ...shared, '../page.module.css': { default: {} },
  }).default;
  const Text = load('app/components/LocalizedText.tsx', shared).default;
  const html = renderToStaticMarkup(React.createElement(provider.default, { language: 'kz' },
    React.createElement(Switch), React.createElement(Text, { text: 'Why Sketo' })));
  assert.match(html, /aria-pressed="true" aria-disabled="false">kz/);
  assert.match(html, /Неліктен Sketo/);
  assert.doesNotMatch(html, / disabled=""/);
});

test('every local coffee and equipment item has complete Kazakh copy', () => {
  const { catalogItems } = load('app/catalog/catalog-data.ts');
  const { equipmentItems } = load('app/catalog/equipment/equipment-data.ts');
  assert.equal(catalogItems.length + equipmentItems.length, 14);
  for (const item of [...catalogItems, ...equipmentItems]) {
    assert.ok(item.translations.kz.description.length > 20, item.slug);
    assert.equal(item.translations.kz.details.length, item.translations.ru.details.length, item.slug);
    if (item.translations.ru.features) {
      assert.equal(item.translations.kz.features.length, item.translations.ru.features.length, item.slug);
      assert.equal(item.translations.kz.specifications.length, item.translations.ru.specifications.length, item.slug);
    }
  }
});

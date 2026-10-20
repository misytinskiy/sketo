import { test } from 'node:test';
import assert from 'node:assert/strict';
import vm from 'node:vm';
import ts from 'typescript';
import { readFileSync } from 'node:fs';
import * as jsx from 'react/jsx-runtime';

function load(file, modules) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(file, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021, jsx: ts.JsxEmit.ReactJSX },
  }).outputText, { exports, Response, require: name => { assert.ok(name in modules, name); return modules[name]; } });
  return exports;
}
test('staff page renders core products without fetching accessories', async () => {
  const products = [{ id: 'coffee' }]; let authorised = false;
  const Page = load('app/staff/page.tsx', {
    'react/jsx-runtime': jsx, '@/lib/staff-auth': { requireStaff: async () => { authorised = true; } },
    './staff-data': { getStaffProducts: async () => { assert.ok(authorised); return products; } },
    './StaffPageClient': { default: () => null },
  }).default;
  const result = await Page();
  assert.equal(result.props.products, products);
  assert.equal('accessories' in result.props, false);
});
function route(member, fetchItems) {
  return load('app/staff/accessories/list/route.ts', {
    '@/lib/staff-auth': { getCurrentStaff: async () => member },
    '../data': { getStaffAccessories: fetchItems, isMissingAccessorySchema: () => false },
  });
}
test('private accessory endpoint rejects a guest without reading catalogue data', async () => {
  const response = await route(null, () => assert.fail('Guest read')).GET();
  assert.equal(response.status, 401);
  assert.match(response.headers.get('cache-control'), /private, no-store/);
});
test('private endpoint returns authorised data without caching it', async () => {
  const response = await route({ id: 'staff' }, async () => [{ id: 'accessory' }]).GET();
  assert.equal(response.status, 200);
  assert.deepEqual(await response.json(), { items: [{ id: 'accessory' }] });
  assert.match(response.headers.get('cache-control'), /no-store/);
});
test('accessory outage is a retryable local error without leaking database details', async () => {
  const response = await route({ id: 'staff' }, async () => { throw new Error('postgres://secret'); }).GET();
  assert.equal(response.status, 503);
  assert.ok(!(await response.text()).includes('postgres://secret'));
});

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';

function load(path, modules = {}) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, require(name) { assert.ok(name in modules, `Missing mock: ${name}`); return modules[name]; }, Buffer, Date, URL, process: { env: { SUPABASE_SERVICE_ROLE_KEY: 'test-only' } } });
  return exports;
}
const profile = load('lib/customer-profile.ts');
const recovery = load('lib/password-recovery.ts', { 'node:crypto': crypto });
const form = (values) => { const result = new FormData(); for (const [key, value] of Object.entries(values)) result.set(key, value); return result; };
const valid = { full_name: 'Alice', phone: '+7 (700) 123-45-67', account_type: 'personal' };

function setup({ user = { id: 'owner', email: 'owner@example.com' }, failSave = false, grant = '', wrongPassword = false } = {}) {
  const calls = [];
  const client = {
    from(table) { calls.push(['table', table]); return { upsert: async row => { calls.push(['save', row]); return { error: failSave ? {} : null }; } }; },
    auth: {
      getUser: async () => ({ data: { user }, error: null }),
      signInWithPassword: async args => { calls.push(['signin', args]); return { data: { user: wrongPassword ? null : user }, error: wrongPassword ? {} : null }; },
      updateUser: async (...args) => { calls.push(['update', ...args]); return { error: null }; },
      signUp: async args => { calls.push(['signup', args]); return { data: { session: null }, error: null }; },
      resetPasswordForEmail: async (...args) => { calls.push(['recover', ...args]); return { error: null }; },
    },
  };
  const actions = load('app/account/actions.ts', {
    '@/lib/customer-profile': profile, '@/lib/password-recovery': recovery,
    '@/lib/supabase/server': { createClient: async () => client },
    '@/lib/site-url': { getSiteUrl: () => new URL('https://sketo.example') },
    'next/headers': { cookies: async () => ({ get: () => ({ value: grant }), delete: name => calls.push(['delete', name]) }) },
    'next/navigation': { redirect: path => { throw new Error(`redirect:${path}`); } },
    'next/cache': { revalidatePath: path => calls.push(['revalidate', path]) },
  });
  return { ...actions, calls };
}

test('profile validation normalizes phones and excludes ownership and loyalty fields', () => {
  const parsed = profile.parseCustomerProfile(form({ ...valid, user_id: 'victim', poster_client_id: 'other', discount: '100', company_name: 'old', bin: 'old' }));
  assert.equal(parsed.phone, '+77001234567');
  assert.deepEqual(Object.keys(parsed).sort(), ['account_type', 'bin', 'company_name', 'full_name', 'phone']);
  assert.equal(parsed.company_name, '');
  for (const change of [{ phone: '7001234567' }, { phone: '+7abc7001234567' }, { full_name: ' ' }, { account_type: 'admin' }, { account_type: 'business', company_name: 'X', bin: '123' }]) {
    assert.equal(profile.parseCustomerProfile(form({ ...valid, ...change })), null);
  }
  assert.ok(profile.parseCustomerProfile(form({ ...valid, account_type: 'business', company_name: 'Company', bin: '123456789012' })));
});
test('guests cannot save a profile', async () => {
  const s = setup({ user: null });
  assert.equal((await s.saveCustomerProfile({}, form(valid))).status, 'error');
  assert.deepEqual(s.calls, []);
});
test('profile saves only as authenticated owner; failed writes are not reported as saved', async () => {
  const s = setup();
  assert.equal((await s.saveCustomerProfile({}, form({ ...valid, user_id: 'victim' }))).status, 'success');
  assert.equal(s.calls.find(([type]) => type === 'save')[1].user_id, 'owner');
  const failed = setup({ failSave: true });
  assert.equal((await failed.saveCustomerProfile({}, form(valid))).status, 'error');
  assert.equal(failed.calls.some(([type]) => type === 'revalidate'), false);
});
test('email changes reauthenticate current identity, ignoring submitted identity', async () => {
  const s = setup();
  assert.equal((await s.changeCustomerEmail({}, form({ email: 'new@example.com', currentPassword: 'password', user_id: 'victim' }))).status, 'success');
  assert.equal(s.calls[0][1].email, 'owner@example.com');
  assert.equal(s.calls[1][1].email, 'new@example.com');
  const bad = setup({ wrongPassword: true });
  assert.equal((await bad.changeCustomerEmail({}, form({ email: 'new@example.com', currentPassword: 'wrong' }))).status, 'error');
  assert.equal(bad.calls.some(([type]) => type === 'update'), false);
});
test('password reset requires valid proof bound to this user', async () => {
  const data = form({ password: 'new-password-1234', confirmation: 'new-password-1234' });
  for (const grant of ['', recovery.createRecoveryGrant('victim')]) {
    const s = setup({ grant });
    assert.equal((await s.customerResetPassword({}, data)).status, 'error');
    assert.deepEqual(s.calls, []);
  }
  const s = setup({ grant: recovery.createRecoveryGrant('owner') });
  assert.equal((await s.customerResetPassword({}, data)).status, 'success');
  assert.deepEqual(s.calls.map(([type]) => type), ['update', 'delete']);
});
test('registration validates password confirmation and consent before contacting provider', async () => {
  for (const values of [{ consent: '' }, { confirmation: 'different' }]) {
    const s = setup();
    assert.equal((await s.customerRegister({}, form({ email: 'a@example.com', password: 'new-password-1234', confirmation: 'new-password-1234', consent: 'on', ...values }))).status, 'error');
    assert.deepEqual(s.calls, []);
  }
});
test('recovery email uses a fixed callback, never a submitted redirect', async () => {
  const s = setup();
  await s.customerForgotPassword({}, form({ email: ' A@EXAMPLE.COM ', redirectTo: 'https://attacker.example' }));
  assert.equal(s.calls[0][1], 'a@example.com');
  assert.equal(s.calls[0][2].redirectTo, 'https://sketo.example/auth/customer?recovery=1');
});
test('customer callback never grants password reset based on query parameters alone', async () => {
  for (const redirectType of [null, 'recovery']) {
    const changes = [];
    const route = load('app/auth/customer/route.ts', {
      '@/lib/password-recovery': recovery,
      '@/lib/site-url': { getSiteUrl: () => new URL('https://sketo.example') },
      'next/headers': { cookies: async () => ({ delete() {}, set: (...args) => changes.push(args) }) },
      'next/server': { NextResponse: { redirect: url => ({ url: url.href, headers: new Headers() }) } },
      '@/lib/supabase/server': { createClient: async () => ({ auth: { exchangeCodeForSession: async () => ({ data: { user: { id: 'owner' }, redirectType }, error: null }) } }) },
    });
    const response = await route.GET({ url: 'https://sketo.example/auth/customer?code=code&recovery=1&next=https://attacker.example' });
    assert.equal(changes.length, redirectType === 'recovery' ? 1 : 0);
    assert.equal(response.url, 'https://sketo.example/account/reset-password' + (redirectType === 'recovery' ? '' : '?invalid=1'));
  }
});

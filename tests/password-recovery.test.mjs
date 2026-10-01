import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as crypto from 'node:crypto';

function load(path, modules) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText, { exports, require(name) { assert.ok(name in modules, `Missing mock: ${name}`); return modules[name]; },
    Buffer, Date, URL, process: { env: { SUPABASE_SERVICE_ROLE_KEY: 'test-only-signing-secret' } } });
  return exports;
}
const recovery = load('lib/password-recovery.ts', { 'node:crypto': crypto });
const member = { userId: 'user-1', email: 'staff@example.com' };
const initial = { status: 'idle', message: '' };
const form = (values) => { const data = new FormData(); for (const [k, v] of Object.entries(values)) data.set(k, v); return data; };
const validForm = () => form({ password: 'a-new-password-123', confirmation: 'a-new-password-123', currentPassword: 'old-password-123' });

function setup({ active = true, grant = recovery.createRecoveryGrant(member.userId), wrongPassword = false, failUpdate = false } = {}) {
  const calls = [];
  const client = { auth: {
    getUser: async () => ({ data: { user: { id: member.userId, email: member.email } }, error: null }),
    signInWithPassword: async (args) => { calls.push(['reauth', args]); return { data: { user: wrongPassword ? null : { id: member.userId } }, error: wrongPassword ? {} : null }; },
    updateUser: async (args) => { calls.push(['update', args]); return { error: failUpdate ? {} : null }; },
    resetPasswordForEmail: async (...args) => { calls.push(['request', ...args]); return { error: null }; },
  } };
  const modules = {
    '@/lib/staff-auth': { getCurrentStaff: async () => active ? member : null, requireStaff: async () => { if (!active) throw new Error('denied'); return member; } },
    '@/lib/supabase/server': { createClient: async () => client },
    '@/lib/site-url': { getSiteUrl: () => new URL('https://sketo.example') },
    '@/lib/password-recovery': recovery,
    'next/headers': { cookies: async () => ({ get: () => ({ value: grant }), delete: (name) => calls.push(['delete', name]) }) },
  };
  return { ...load('app/login/password-actions.ts', modules), ...load('app/staff/security/actions.ts', modules), calls };
}

test('recovery grants reject forgery, another user, expired and malformed tokens', () => {
  const now = 1000000;
  const token = recovery.createRecoveryGrant('user-1', now);
  assert.equal(recovery.verifyRecoveryGrant('user-1', token, now), true);
  assert.equal(recovery.verifyRecoveryGrant('user-2', token, now), false);
  assert.equal(recovery.verifyRecoveryGrant('user-1', token, now + 900000), false);
  for (const invalid of ['', token + '.extra', '1001.bad', token.slice(0, -1) + (token.endsWith('a') ? 'b' : 'a')]) {
    assert.equal(recovery.verifyRecoveryGrant('user-1', invalid, now), false);
  }
});

test('reset rejects missing proof and revoked membership before updating password', async () => {
  for (const options of [{ grant: '' }, { grant: recovery.createRecoveryGrant('another-user') }, { active: false }]) {
    const s = setup(options);
    assert.equal((await s.resetPassword(initial, validForm())).status, 'error');
    assert.deepEqual(s.calls, []);
  }
});

test('password confirmation and bounds are enforced on the server', async () => {
  for (const values of [{ password: 'short', confirmation: 'short' }, { password: 'a'.repeat(257), confirmation: 'a'.repeat(257) }, { password: 'a-new-password-123', confirmation: 'different-password' }]) {
    const s = setup();
    assert.equal((await s.resetPassword(initial, form(values))).status, 'error');
    assert.deepEqual(s.calls, []);
  }
});

test('successful reset updates only password and clears recovery permission', async () => {
  const s = setup();
  assert.equal((await s.resetPassword(initial, validForm())).status, 'success');
  assert.equal(s.calls[0][0], 'update');
  assert.deepEqual(Object.keys(s.calls[0][1]), ['password']);
  assert.deepEqual(s.calls[1], ['delete', recovery.RECOVERY_COOKIE]);
});

test('provider failure is not reported as a successful reset', async () => {
  const s = setup({ failUpdate: true });
  assert.equal((await s.resetPassword(initial, validForm())).status, 'error');
  assert.equal(s.calls.some(([kind]) => kind === 'delete'), false);
});

test('password change rejects guests and incorrect current password', async () => {
  await assert.rejects(setup({ active: false }).changePassword(initial, validForm()), /denied/);
  const s = setup({ wrongPassword: true });
  assert.equal((await s.changePassword(initial, validForm())).status, 'error');
  assert.deepEqual(s.calls.map(([kind]) => kind), ['reauth']);
});

test('password change reauthenticates the verified user, ignoring submitted identity', async () => {
  const s = setup();
  const data = validForm(); data.set('email', 'attacker@example.com');
  assert.equal((await s.changePassword(initial, data)).status, 'success');
  assert.equal(s.calls[0][1].email, member.email);
  assert.deepEqual(s.calls.map(([kind]) => kind), ['reauth', 'update']);
});

test('reset request uses the fixed configured callback and normalizes email', async () => {
  const s = setup();
  const result = await s.requestPasswordReset(initial, form({ email: ' STAFF@Example.com ', redirectTo: 'https://attacker.example' }));
  assert.equal(result.status, 'success');
  assert.equal(s.calls[0][1], 'staff@example.com');
  assert.equal(s.calls[0][2].redirectTo, 'https://sketo.example/auth/recovery');
});

function callbackSetup({ valid = true, active = true, type = 'recovery' } = {}) {
  const changes = [];
  const route = load('app/auth/recovery/route.ts', {
    'next/headers': { cookies: async () => ({ delete: (name) => changes.push(['delete', name]), set: (...args) => changes.push(['set', ...args]) }) },
    'next/server': { NextResponse: { redirect: (url) => ({ url: url.href, headers: new Headers() }) } },
    '@/lib/site-url': { getSiteUrl: () => new URL('https://sketo.example') },
    '@/lib/password-recovery': recovery,
    '@/lib/staff-auth': { getCurrentStaff: async () => active ? member : null },
    '@/lib/supabase/server': { createClient: async () => ({ auth: {
      exchangeCodeForSession: async () => ({ data: { user: { id: member.userId }, redirectType: type }, error: valid ? null : {} }),
      signOut: async () => { changes.push(['signOut']); },
    } }) },
  });
  return { ...route, changes };
}

test('callback grants access only for an active member and a successful recovery exchange', async () => {
  const s = callbackSetup();
  const result = await s.GET({ url: 'https://sketo.example/auth/recovery?code=test&next=https://attacker.example' });
  assert.equal(result.url, 'https://sketo.example/login/reset-password');
  const grant = s.changes.find(([kind]) => kind === 'set');
  assert.equal(grant[3].httpOnly, true);
  assert.equal(grant[3].secure, true);
  assert.equal(recovery.verifyRecoveryGrant(member.userId, grant[2]), true);
  assert.equal(result.headers.get('Cache-Control'), 'private, no-store');
});

test('expired codes, non-recovery exchanges and revoked staff never receive a grant', async () => {
  for (const options of [{ valid: false }, { type: 'signin' }, { active: false }]) {
    const s = callbackSetup(options);
    const result = await s.GET({ url: 'https://sketo.example/auth/recovery?code=test' });
    assert.equal(result.url, 'https://sketo.example/login/reset-password?invalid=1');
    assert.equal(s.changes.some(([kind]) => kind === 'set'), false);
  }
});

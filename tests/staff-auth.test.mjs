import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';
import * as orm from 'drizzle-orm';

function load(path, modules) {
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync(path, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 },
  }).outputText, { exports, require: (name) => {
    assert.ok(name in modules, `Missing mock: ${name}`); return modules[name];
  }, console: { error() {} }, Date });
  return exports;
}

function authSetup({ user = { id: 'auth-id' }, error = null, role = 'editor', active = true, missing = false } = {}) {
  let reads = 0;
  let member = missing ? undefined : { id: 'member-id', userId: 'auth-id', role, isActive: active, email: 'staff@example.com', displayName: 'Staff' };
  const auth = load('lib/staff-auth.ts', {
    'server-only': {}, react: { cache: (fn) => fn }, 'drizzle-orm': orm,
    'next/navigation': { redirect: (path) => { throw new Error(`redirect:${path}`); } },
    '@/lib/db/schema': { staffMembers: { userId: 'user_id' } },
    '@/lib/db': { db: { query: { staffMembers: { findFirst: async () => { reads++; return member; } } } } },
    '@/lib/supabase/server': { createClient: async () => ({ auth: { getUser: async () => ({ data: { user }, error }) } }) },
  });
  return { ...auth, reads: () => reads, revoke: () => { member.isActive = false; } };
}

test('guest and forged/expired sessions never read membership', async () => {
  for (const input of [{ user: null }, { error: new Error('invalid token') }]) {
    const s = authSetup(input);
    await assert.rejects(s.requireStaff(), /redirect:\/login/);
    assert.equal(s.reads(), 0);
  }
});

test('missing, disabled and legacy viewer memberships are denied', async () => {
  for (const input of [{ missing: true }, { active: false }, { role: 'viewer' }]) {
    await assert.rejects(authSetup(input).requireStaff(), /redirect:\/login/);
  }
});

test('personnel can enter staff but cannot administer users; admin can', async () => {
  const staff = authSetup();
  assert.equal((await staff.requireStaff()).role, 'staff');
  await assert.rejects(staff.requireAdmin(), /администратору/);
  assert.equal((await authSetup({ role: 'admin' }).requireAdmin()).role, 'admin');
});

test('revocation is observed on the next authorization request', async () => {
  const s = authSetup();
  await s.requireStaff(); s.revoke();
  await assert.rejects(s.requireStaff(), /redirect:\/login/);
});

// Execute EVERY exported action, rather than asserting that its source contains a
// guard. No database, storage, form parsing or cache call may precede authorization.
for (const file of ['app/staff/actions.ts', 'app/staff/permanent-delete.ts', 'app/staff/edit/[kind]/[slug]/actions.ts', 'app/staff/users/actions.ts']) {
  test(`${file}: every action rejects unauthorized callers before side effects`, async () => {
    const denied = new Error('access-denied');
    const fail = () => { assert.fail('Side effect before authorization'); };
    const source = readFileSync(file, 'utf8');
    const modules = Object.fromEntries([...source.matchAll(/from\s+["']([^"']+)["']/g)].map((m) => [m[1], new Proxy({}, { get: () => fail })]));
    modules['@/lib/staff-auth'] = { requireStaff: async () => { throw denied; }, requireAdmin: async () => { throw denied; } };
    const actions = load(file, modules);
    assert.ok(Object.keys(actions).length);
    for (const [name, action] of Object.entries(actions)) {
      await assert.rejects(() => action(undefined, undefined), (error) => error === denied, name);
    }
  });
}

const actorId = '11111111-1111-4111-8111-111111111111';
const targetId = '22222222-2222-4222-8222-222222222222';

function userActions({ targetRole = 'editor', authFailure = false, insertFailure = false, revoked = false, adminCount = 2 } = {}) {
  const events = [];
  const actor = { id: actorId, role: 'admin', isActive: !revoked };
  const target = { id: targetId, userId: 'target-auth', role: targetRole, isActive: true, email: 'target@example.com' };
  const schema = { staffMembers: { id: 'id', role: 'role', isActive: 'isActive' } };
  let lookups = 0;
  const db = {
    execute: async () => events.push('lock'),
    query: { staffMembers: { findFirst: async () => (++lookups % 2 === 1 ? actor : target) } },
    select: () => ({ from: () => ({ where: async () => Array.from({ length: adminCount }, () => ({})) }) }),
    insert: () => ({ values: (data) => ({ returning: async () => {
      if (insertFailure) throw new Error('database unavailable'); events.push(['insert', data]); return [{ id: targetId }];
    } }) }),
    update: () => ({ set: (values) => ({ where: async () => { events.push('revoke'); target.isActive = values.isActive; } }) }),
    delete: () => ({ where: async () => events.push('delete-member') }),
    transaction: async (fn) => { const value = await fn(db); events.push('commit'); return value; },
  };
  const actions = load('app/staff/users/actions.ts', {
    'drizzle-orm': orm, 'next/cache': { revalidatePath: () => events.push('revalidate') },
    '@/lib/staff-auth': { requireAdmin: async () => actor },
    '@/lib/db': { db }, '@/lib/db/schema': schema,
    '@/lib/db/editor': { appendAuditLog: async (data) => events.push(['audit', data]) },
    '@/lib/supabase/admin': { createAdminClient: () => ({ auth: { admin: {
      createUser: async () => { events.push('create-auth'); return { data: { user: { id: 'new-auth' } }, error: null }; },
      deleteUser: async () => { events.push('delete-auth'); return { error: authFailure ? new Error('offline') : null }; },
    } } }) },
  });
  function form(fields) { const data = new FormData(); for (const [key, value] of Object.entries(fields)) data.set(key, value); return data; }
  return { events, target,
    remove: (overrides = {}) => actions.deleteStaffUser({}, form({ id: targetId, confirmation: target.email, ...overrides })),
    create: (overrides = {}) => actions.createStaffUser({}, form({ email: target.email, displayName: 'New staff', role: 'staff', password: 'long-random-password', ...overrides })),
  };
}

test('create grants the requested role without logging credentials', async () => {
  for (const role of ['staff', 'admin']) {
    const s = userActions();
    assert.equal((await s.create({ role })).status, 'success');
    const inserted = s.events.find((event) => event[0] === 'insert')[1];
    assert.equal(inserted.role, role === 'admin' ? 'admin' : 'editor');
    assert.ok(!JSON.stringify(s.events).includes('long-random-password'));
  }
});

test('invalid creation and revoked administrator cannot grant membership', async () => {
  const s = userActions();
  assert.equal((await s.create({ role: 'viewer' })).status, 'error');
  assert.equal(s.events.length, 0);
  const revoked = userActions({ revoked: true });
  assert.equal((await revoked.create()).status, 'error');
  assert.ok(revoked.events.includes('delete-auth'));
  assert.ok(!revoked.events.some((event) => event[0] === 'insert'));
});

test('failed membership creation compensates the Auth account', async () => {
  const s = userActions({ insertFailure: true });
  assert.equal((await s.create()).status, 'error');
  assert.ok(s.events.includes('delete-auth'));
});

test('self deletion, last admin, wrong confirmation and revoked actor are denied', async () => {
  for (const [options, fields] of [[{}, { id: actorId }], [{ targetRole: 'admin', adminCount: 1 }, {}], [{}, { confirmation: 'wrong@example.com' }], [{ revoked: true }, {}]]) {
    const s = userActions(options);
    assert.equal((await s.remove(fields)).status, 'error');
    assert.ok(!s.events.includes('revoke'));
    assert.ok(!s.events.includes('delete-auth'));
  }
});

test('deletion commits revocation before deleting Auth account', async () => {
  const s = userActions();
  assert.equal((await s.remove()).status, 'success');
  assert.ok(s.events.indexOf('revoke') < s.events.indexOf('commit'));
  assert.ok(s.events.indexOf('commit') < s.events.indexOf('delete-auth'));
  assert.ok(s.events.indexOf('delete-auth') < s.events.indexOf('delete-member'));
});

test('Auth failure leaves disabled membership available for retry', async () => {
  const s = userActions({ authFailure: true });
  assert.equal((await s.remove()).status, 'error');
  assert.equal(s.target.isActive, false);
  assert.ok(!s.events.includes('delete-member'));
  assert.ok(s.events.includes('revalidate'));
});

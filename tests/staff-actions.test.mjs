import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import * as buffer from 'node:buffer';
import vm from 'node:vm';
import ts from 'typescript';
import sharp from 'sharp';
import { randomUUID } from 'node:crypto';

const productForm = {};
vm.runInNewContext(ts.transpileModule(readFileSync("lib/product-form.ts", "utf8"), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, { exports: productForm });
const validation = {};
vm.runInNewContext(ts.transpileModule(readFileSync('lib/supabase/media-validation.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, { exports: validation });

// Execute the actual server action with an isolated database and cache boundary.
function setup(product, options = {}) {
  product = { ...product };
  const writes = [];
  let snapshots = 0;
  let previousState = {};
  const cleanupJobs = [];
  let cleanupCalls = 0;
  let uploaded = 0;
  const invalidatedTags = [];
  const db = {
    query: {
      products: { findFirst: async () => options.slugAvailable ? undefined : product },
      productTranslations: { findFirst: async () => null },
    },
    select: () => ({ from: (table) => {
      const data = table === tables.productImages ? (options.images ?? []) : [];
      const result = { for: async () => [product], orderBy: async () => data, then: (resolve) => resolve(data) };
      const chain = { where: () => result, innerJoin: () => chain };
      return chain;
    } }),
    update: () => ({ set: (values) => ({ where: () => {
      const commit = () => { if (options.triggerTime) values.updatedAt = options.triggerTime; writes.push(values); Object.assign(product, values); };
      return { then: (resolve) => { commit(); resolve(); }, returning: async () => { commit(); return [{ updatedAt: product.updatedAt }]; } };
    } }) }),
    insert: () => ({ values: () => ({ returning: async () => [{ id: "asset" }] }) }),
    delete: (target) => {
      assert.notEqual(target, tables.products, 'Product and revision history must survive deletion');
      return { where: async () => {} };
    },
    transaction: async (callback) => {
      const savedProduct = { ...product };
      const before = writes.length;
      const beforeSnapshots = snapshots;
      try { return await callback(db); }
      catch (error) { product = savedProduct; writes.length = before; snapshots = beforeSnapshots; throw error; }
    },
  };
  const tables = new Proxy({}, { get: (target, key) => target[key] ??= new Proxy({}, { get: (_, column) => `${String(key)}.${String(column)}` }) });
  const exports = {};
  const modules = {
    'node:buffer': buffer,
    'sharp': { default: sharp },
    '@/lib/supabase/media-validation': validation,
    '@/lib/product-form': productForm,
    '@/lib/supabase/media-cleanup': {
      queueMediaCleanup: async (_, path) => { cleanupJobs.push(path); return { id: randomUUID() }; },
      processMediaCleanup: async () => { cleanupCalls++; return 0; },
    },
    'drizzle-orm': { and: () => null, asc: () => null, eq: () => null, sql: Object.assign(() => null, { join: () => null }) },
    'next/cache': { updateTag: (tag) => invalidatedTags.push(tag), revalidatePath: () => {} },
    'next/navigation': { redirect: (path) => { throw new Error(`redirect:${path}`); } },
    '@/lib/db': { db },
    '@/lib/db/editor': {
      createProductRevisionSnapshot: async (_, tx) => { assert.equal(tx, db); snapshots++; },
      appendAuditLog: async (_, tx) => { assert.equal(tx, db); if (options.auditFailure) throw new Error('Audit failure'); },
    },
    '@/lib/db/schema': tables,
    '@/lib/supabase/admin': { createAdminClient: () => ({ storage: { from: () => ({ upload: async () => { uploaded++; return { error: options.uploadFailure ? new Error('Storage unavailable') : null }; } }) } }) },
    '@/lib/supabase/storage-public': { normalizeStorageObjectPath: (_, path) => path, getStorageBucketName: () => 'catalog', resolveCoffeeStorageUrl: (path) => path },
  };
  const source = readFileSync('app/staff/edit/[kind]/[slug]/actions.ts', 'utf8');
  vm.runInNewContext(ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, {
    exports, require: (name) => { assert.ok(name in modules, name); return modules[name]; }, Date, File, crypto: { randomUUID }, console: { error: () => {} },
  });
  return { run: async (intent, fields = {}) => {
    const data = new FormData();
    for (const [key, value] of Object.entries({ kind: 'coffee', slug: 'sample', intent, status: 'in_stock', version: product.updatedAt.toISOString(), ...fields })) data.set(key, value);
    previousState = await exports.submitEditorForm(previousState, data);
    return previousState;
  }, upload: async (file) => {
    const data = new FormData();
    data.set('kind', 'coffee'); data.set('slug', 'sample'); data.set('version', product.updatedAt.toISOString()); data.set('files', file);
    return exports.uploadProductMedia(data);
  }, reorder: async (ids) => {
    const data = new FormData();
    data.set('kind', 'coffee'); data.set('slug', 'sample'); data.set('version', product.updatedAt.toISOString());
    ids.forEach((id) => data.append('imageIds', id));
    return exports.updateProductMediaOrder(data);
  }, invalidatedTags, writes, cleanupJobs, cleanupCalls: () => cleanupCalls, uploaded: () => uploaded, snapshots: () => snapshots };
}
const base = { id: 'test', slug: 'sample', type: 'coffee', isPublished: false, editorialState: 'draft', updatedAt: new Date('2026-09-07T00:00:00Z') };

test('incomplete draft can be saved without publication', async () => {
  const s = setup(base);
  assert.equal((await s.run('save_draft')).status, 'success');
  assert.equal(s.writes[0].isPublished, false);
});
test('saving a published item preserves visibility', async () => {
  const s = setup({ ...base, isPublished: true, editorialState: 'published' });
  await s.run('save_draft', { titleRu: 'Coffee', descriptionRu: 'Description' });
  assert.equal(s.writes[0].isPublished, true);
  assert.equal(s.writes[0].editorialState, 'published');
});
test('incomplete publication is rejected without mutations', async () => {
  const s = setup(base);
  assert.equal((await s.run('publish')).status, 'error');
  assert.equal(s.writes.length, 0);
});
test('delete archives instead of cascading history and returns the list destination', async () => {
  const s = setup(base);
  const result = await s.run('delete');
  assert.equal(result.status, 'success');
  assert.equal(result.href, '/staff');
  assert.equal(s.writes[0].editorialState, 'archived');
  assert.equal(s.writes[0].isPublished, false);
  assert.equal(s.snapshots(), 1);
});
test('restore returns archived item to unpublished draft', async () => {
  const s = setup({ ...base, editorialState: 'archived' });
  await s.run('restore');
  assert.equal(s.writes[0].editorialState, 'draft');
  assert.equal(s.writes[0].archivedAt, null);
  assert.equal(s.writes[0].isPublished, false);
});
test('archived product cannot be accidentally published', async () => {
  const s = setup({ ...base, editorialState: 'archived' });
  assert.equal((await s.run('publish', { titleRu: 'Coffee', descriptionRu: 'Description' })).status, 'error');
  assert.equal(s.writes.length, 0);
});
test('unpublish explicitly hides the item', async () => {
  const s = setup({ ...base, isPublished: true });
  await s.run('unpublish');
  assert.equal(s.writes[0].isPublished, false);
});
test('unknown intent never changes data', async () => {
  const s = setup(base);
  assert.equal((await s.run('invalid')).status, 'error');
  assert.equal(s.writes.length, 0);
});


test('stale editor cannot overwrite a newer product', async () => {
  const s = setup(base);
  assert.equal((await s.run('save_draft', { version: '2020-01-01T00:00:00.000Z' })).status, 'error');
  assert.equal(s.writes.length, 0);
  assert.equal(s.snapshots(), 0);
});
test('audit failure rolls back changes and revision together', async () => {
  const s = setup(base, { auditFailure: true });
  assert.equal((await s.run('save_draft')).status, 'error');
  assert.equal(s.writes.length, 0);
  assert.equal(s.snapshots(), 0);
});
test('successful save returns a strictly newer version', async () => {
  const s = setup(base);
  const result = await s.run('save_draft');
  assert.equal(result.status, 'success');
  assert.ok(new Date(result.version) > base.updatedAt);
});
test('unsupported and oversized files never reach Storage', async () => {
  const s = setup(base);
  assert.equal((await s.upload(new File(['<svg/>'], 'image.svg', { type: 'image/svg+xml' }))).status, 'error');
  assert.equal((await s.upload(new File([new Uint8Array(5 * 1024 * 1024 + 1)], 'image.png', { type: 'image/png' }))).status, 'error');
  assert.equal(s.uploaded(), 0);
});
test('forged image headers fail decoding before upload', async () => {
  const s = setup(base);
  const file = new File([new Uint8Array([137, 80, 78, 71, 13, 10, 26, 10, 0, 0, 0, 0])], 'fake.png', { type: 'image/png' });
  assert.equal((await s.upload(file)).status, 'error');
  assert.equal(s.uploaded(), 0);
});
test('failed Storage upload has durable compensation and attempts cleanup', async () => {
  const s = setup(base, { uploadFailure: true });
  const bytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
  assert.equal((await s.upload(new File([bytes], 'sample.png', { type: 'image/png' }))).status, 'error');
  assert.equal(s.uploaded(), 1);
  assert.equal(s.cleanupJobs.length, 1);
  assert.ok(s.cleanupCalls() >= 1);
  assert.equal(s.writes.length, 0);
});

function cleanupSetup({ referenced = false, failStorage = false } = {}) {
  const job = { id: 'job', diff: { kind: 'coffee', path: 'coffee/sample/file.webp', cleanupPending: true } };
  const completed = [];
  let removeCalls = 0;
  let reads = 0;
  const tables = new Proxy({}, { get: (target, key) => target[key] ??= new Proxy({}, { get: (_, column) => `${String(key)}.${String(column)}` }) });
  const builder = () => {
    const chain = {
      from: () => chain, innerJoin: () => chain, where: () => chain,
      limit: async () => { reads++; return reads === 1 ? [job] : referenced && reads === 2 ? [{ id: 'shared-image' }] : []; },
    };
    return chain;
  };
  const db = {
    select: builder,
    update: () => ({ set: (value) => ({ where: async () => { completed.push(value.diff); } }) }),
    delete: () => ({ where: async () => {} }),
    transaction: async (callback) => callback(db),
  };
  const exports = {};
  const modules = {
    'drizzle-orm': { and: () => null, eq: () => null, inArray: () => null, sql: () => null },
    '@/lib/db': { db }, '@/lib/db/schema': tables, '@/lib/db/editor': {},
    './admin': { createAdminClient: () => ({ storage: { from: () => ({ remove: async () => { removeCalls++; return { error: failStorage ? new Error('offline') : null }; } }) } }) },
    './storage-public': { getStorageBucketName: () => 'catalog', resolveCoffeeStorageUrl: (path) => `https://storage/${path}` },
  };
  vm.runInNewContext(ts.transpileModule(readFileSync('lib/supabase/media-cleanup.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, {
    exports, require: (name) => modules[name], console: { error: () => {} },
  });
  return { run: () => exports.processMediaCleanup(['job']), completed, removeCalls: () => removeCalls };
}
test('cleanup retains a file referenced by another product', async () => {
  const s = cleanupSetup({ referenced: true });
  assert.equal(await s.run(), 0);
  assert.equal(s.removeCalls(), 0);
  assert.equal(s.completed[0].retained, true);
});
test('cleanup failure keeps its durable job pending after three attempts', async () => {
  const s = cleanupSetup({ failStorage: true });
  assert.equal(await s.run(), 1);
  assert.equal(s.removeCalls(), 3);
  assert.equal(s.completed.length, 0);
});
test('unreferenced file is removed and cleanup job completed', async () => {
  const s = cleanupSetup();
  assert.equal(await s.run(), 0);
  assert.equal(s.removeCalls(), 1);
  assert.equal(s.completed[0].cleanupPending, false);
});


test('valid upload commits media and advances editor version', async () => {
  const s = setup(base);
  const bytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
  const result = await s.upload(new File([bytes], 'sample.png', { type: 'image/png' }));
  assert.equal(result.status, 'success');
  assert.equal(s.uploaded(), 1);
  assert.ok(new Date(result.version) > base.updatedAt);
  assert.match(s.writes[0].imageUrl, /\.webp$/);
  assert.equal(s.snapshots(), 1);
});
test('audit failure after upload rolls back media and triggers cleanup', async () => {
  const s = setup(base, { auditFailure: true });
  const bytes = await sharp({ create: { width: 2, height: 2, channels: 3, background: '#ffffff' } }).png().toBuffer();
  const result = await s.upload(new File([bytes], 'sample.png', { type: 'image/png' }));
  assert.equal(result.status, 'error');
  assert.equal(s.uploaded(), 1);
  assert.equal(s.writes.length, 0);
  assert.equal(s.snapshots(), 0);
  assert.equal(s.cleanupJobs.length, 1);
  assert.ok(s.cleanupCalls() > 0);
});

test('retrying product creation with the same request does not create a duplicate', async () => {
  const tables = new Proxy({}, { get: (target, key) => target[key] ??= {} });
  const rows = [];
  let logs = 0;
  const db = {
    execute: async () => {},
    query: { products: { findFirst: async () => rows[0] } },
    select: () => ({ from: () => ({ where: () => Object.assign(Promise.resolve([{ maxSortOrder: -1 }]), { orderBy: async () => [] }) }) }),
    insert: (table) => ({ values: (values) => {
      if (table === tables.products) rows.push(values);
      return { returning: async () => [values] };
    } }),
    transaction: async (callback) => callback(db),
  };
  const modules = {
    'drizzle-orm': { and: () => null, asc: () => null, eq: () => null, like: () => null, or: () => null, sql: () => null },
    'next/cache': { updateTag: () => {}, revalidatePath: () => {} },
    '@/lib/db': { db }, '@/lib/db/schema': tables,
    '@/lib/db/editor': { appendAuditLog: async (_, tx) => { assert.equal(tx, db); logs++; } },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync('app/staff/actions.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, { exports, require: (name) => modules[name], Date });
  const data = new FormData();
  data.set('kind', 'coffee'); data.set('requestId', randomUUID());
  const first = await exports.createStaffProduct(data);
  const second = await exports.createStaffProduct(data);
  assert.equal(first.href, second.href);
  assert.equal(rows.length, 1);
  assert.equal(logs, 1);
});


test('saving coffee invalidates staff and coffee, not equipment', async () => {
  const s = setup(base);
  await s.run('save_draft');
  assert.deepEqual(s.invalidatedTags, ['staff-products', 'coffee-catalog']);
});
test('version returned to the form respects the database timestamp trigger', async () => {
  const triggerTime = new Date('2026-09-08T12:34:56.123Z');
  const s = setup(base, { triggerTime });
  const result = await s.run('save_draft');
  assert.equal(result.version, triggerTime.toISOString());
});


test('slug can be changed without unpublishing the product', async () => {
  const s = setup({ ...base, isPublished: true }, { slugAvailable: true });
  const result = await s.run('save_draft', { newSlug: 'new-address', titleRu: 'Coffee', descriptionRu: 'Description' });
  assert.equal(result.status, 'success');
  assert.equal(result.href, '/staff/edit/coffee/new-address');
  assert.equal(s.writes[0].slug, 'new-address');
  assert.equal(s.writes[0].isPublished, true);
});
test('invalid, reserved and occupied slugs never mutate the product', async () => {
  for (const newSlug of ['', 'BAD SLUG', 'equipment', 'occupied-slug']) {
    const s = setup(base);
    assert.equal((await s.run('save_draft', { newSlug })).status, 'error');
    assert.equal(s.writes.length, 0);
  }
});
test('reordering makes the first image primary', async () => {
  const s = setup(base, { images: [{ id: 'a', url: 'a.webp' }, { id: 'b', url: 'b.webp' }] });
  const result = await s.reorder(['b', 'a']);
  assert.equal(result.status, 'success');
  assert.equal(s.writes.at(-1).imageUrl, 'b.webp');
  assert.equal(s.snapshots(), 1);
});
test('reordering rejects duplicate and foreign image IDs', async () => {
  for (const ids of [['a', 'a'], ['a', 'foreign'], ['a']]) {
    const s = setup(base, { images: [{ id: 'a', url: 'a.webp' }, { id: 'b', url: 'b.webp' }] });
    assert.equal((await s.reorder(ids)).status, 'error');
    assert.equal(s.writes.length, 0);
  }
});

 test('publication errors identify the missing fields without mutations', async () => {
  const s = setup(base);
  const result = await s.run('publish');
  assert.ok(result.fieldErrors.titleRu);
  assert.ok(result.fieldErrors.descriptionRu);
  assert.equal(s.writes.length, 0);
});
test('slug suggestion transliterates Cyrillic and keeps a valid bounded URL', () => {
  assert.equal(productForm.suggestProductSlug('Кофе Бразилия / Café 250 г'), 'kofe-braziliya-cafe-250-g');
  assert.match(productForm.suggestProductSlug('Очень длинное название '.repeat(20)), /^[a-z0-9]+(?:-[a-z0-9]+)*$/);
  assert.ok(productForm.suggestProductSlug('Очень длинное название '.repeat(20)).length <= 80);
});

for (const stale of [false, true]) test(`bulk restore ${stale ? 'rejects stale versions without changes' : 'restores archived items in one update'}`, async () => {
  const rows = [1, 2].map((id) => ({ ...base, id: String(id), slug: `sample-${id}`, editorialState: 'archived' }));
  const writes = [], snapshots = [], tags = [];
  const db = {
    select: () => ({ from: () => ({ where: () => ({ orderBy: () => ({ for: async () => rows }) }) }) }),
    update: () => ({ set: (values) => ({ where: async () => { writes.push(values); } }) }),
    insert: () => ({ values: async () => {} }),
    transaction: async (callback) => callback(db),
  };
  const modules = {
    'drizzle-orm': { and: () => null, asc: () => null, eq: () => null, inArray: () => null, or: () => null },
    'next/cache': { updateTag: (tag) => tags.push(tag), revalidatePath: () => {} },
    '@/lib/db': { db }, '@/lib/db/schema': { products: {}, auditLogs: {} },
    '@/lib/db/editor': { createProductRevisionSnapshots: async (data, tx) => { assert.equal(tx, db); snapshots.push(data.productIds); } },
  };
  const exports = {};
  vm.runInNewContext(ts.transpileModule(readFileSync('app/staff/actions.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2017 } }).outputText, { exports, require: (name) => modules[name], Date, console: { error: () => {} } });
  const ids = rows.map((row) => `coffee:${row.slug}`);
  const versions = Object.fromEntries(ids.map((id) => [id, stale ? 'old' : base.updatedAt.toISOString()]));
  const result = await exports.restoreSelectedStaffProducts(ids, versions);
  assert.equal(result.status, stale ? 'error' : 'success');
  assert.equal(writes.length, stale ? 0 : 1);
  if (!stale) {
    assert.equal(writes[0].editorialState, 'draft');
    assert.equal(writes[0].isPublished, false);
    assert.equal(writes[0].archivedAt, null);
    assert.equal(snapshots[0].length, 2);
    assert.deepEqual(tags, ['staff-products', 'coffee-catalog']);
  }
});

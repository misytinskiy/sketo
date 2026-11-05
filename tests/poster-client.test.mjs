import { test } from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import vm from 'node:vm';
import ts from 'typescript';

const exports = {};
vm.runInNewContext(ts.transpileModule(readFileSync('lib/poster/client.ts', 'utf8'), {
  compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
}).outputText, { exports, URL, AbortSignal, process: { env: {} }, fetch });
const { createPosterClient, normalizePosterAccount } = exports;
const env = { POSTER_ACCOUNT: 'sketo', POSTER_ACCESS_TOKEN: 'test-secret-not-real' };
const json = response => Response.json({ response });

test('account accepts a slug or official HTTPS account URL', () => {
  for (const value of ['sketo', ' https://sketo.joinposter.com/ ', 'sketo.joinposter.com/manage']) assert.equal(normalizePosterAccount(value), 'sketo');
  for (const value of ['', 'https://evil.example', 'https://sketo.joinposter.com.evil.example', 'https://user:password@sketo.joinposter.com', 'http://sketo.joinposter.com', 'https://sketo.joinposter.com:444', 'https://sketo.joinposter.com?token=x']) assert.throws(() => normalizePosterAccount(value));
});
test('requests use only the official host, disable caching and reject redirects', async () => {
  const client = createPosterClient(env, async (url, options) => {
    assert.equal(url.origin, 'https://joinposter.com');
    assert.equal(url.pathname, '/api/settings.getAllSettings');
    assert.equal(url.searchParams.get('token'), env.POSTER_ACCESS_TOKEN);
    assert.equal(options.cache, 'no-store');
    assert.equal(options.redirect, 'error');
    assert.equal(options.method, 'GET');
    assert.ok(options.signal);
    return json({ COMPANY_ID: 'sketo', currency: { currency_code_iso: 'KZT' } });
  });
  assert.equal((await client.verifyAccount()).currency, 'KZT');
});
test('wrong-account token stops inspection before fetching any catalog data', async () => {
  let count = 0;
  const client = createPosterClient(env, async () => { count++; return json({ COMPANY_ID: 'another-account' }); });
  await assert.rejects(client.inspect(), error => error.code === 'account');
  assert.equal(count, 1);
});
test('network/provider errors never reveal tokens, URLs or response bodies', async () => {
  for (const fetcher of [
    async () => { throw new Error(`https://joinposter.com/api?token=${env.POSTER_ACCESS_TOKEN}`); },
    async () => new Response(env.POSTER_ACCESS_TOKEN, { status: 403 }),
    async () => Response.json({ error_code: 10, message: env.POSTER_ACCESS_TOKEN }),
    async () => new Response(`invalid-json ${env.POSTER_ACCESS_TOKEN}`),
  ]) {
    await assert.rejects(createPosterClient(env, fetcher).verifyAccount(), error => {
      assert.equal(String(error).includes(env.POSTER_ACCESS_TOKEN), false);
      assert.equal(String(error).includes('https://'), false);
      assert.equal(error.cause, undefined);
      return true;
    });
  }
});
test('inspection validates list shapes and performs only the five read methods', async () => {
  const called = [];
  const client = createPosterClient(env, async url => {
    called.push(url.pathname);
    return json(called.length === 1 ? { COMPANY_ID: 'sketo' } : []);
  });
  await client.inspect();
  assert.deepEqual(called, ['/api/settings.getAllSettings', '/api/access.getSpots', '/api/menu.getCategories', '/api/menu.getProducts', '/api/clients.getGroups']);
  let first = true;
  const bad = createPosterClient(env, async () => { if (first) { first = false; return json({ COMPANY_ID: 'sketo' }); } return json({ unexpected: 'object' }); });
  await assert.rejects(bad.inspect(), error => error.code === 'response');
});

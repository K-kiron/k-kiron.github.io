import test from 'node:test';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
import { Miniflare, convertV4MiniflareOptions } from 'miniflare';

test('SQLite Durable Object atomically enforces real concurrent requests', async t => {
  const runtime = new Miniflare(convertV4MiniflareOptions({
    modules: ['tests/quota-runtime.js', 'worker/index.js', 'profile-data.js'].map(file => ({ type: 'ESModule', path: fileURLToPath(new URL('../' + file, import.meta.url)) })),
    modulesRoot: fileURLToPath(new URL('../', import.meta.url)),
    compatibilityDate: '2026-09-23',
    durableObjects: { QUOTA: { className: 'DailyQuota', useSQLite: true } },
  }));
  t.after(() => runtime.dispose());
  const check = async (scope, ip) => {
    const response = await runtime.dispatchFetch(`https://local.test/${scope}`, { method: 'POST', body: JSON.stringify({ ip }) });
    assert.equal(response.status, 200);
    return response.json();
  };
  const global = await Promise.all(Array.from({ length: 70 }, (_, i) => check('global', `192.0.2.${i}`)));
  assert.equal(global.filter(item => item.allowed).length, 50);
  const shared = await Promise.all(Array.from({ length: 10 }, () => check('network', '192.0.2.1')));
  assert.equal(shared.filter(item => item.allowed).length, 3);
  assert.ok(shared.filter(item => !item.allowed).every(item => item.reason === 'rate_limit'));
});

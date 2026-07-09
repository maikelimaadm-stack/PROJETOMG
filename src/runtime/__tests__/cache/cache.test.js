import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createCacheEngine, CacheEngine } from '../../infra/cache/cacheEngine.js';
import { CacheError } from '../../infra/cache/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';

/** @param {number} start */
function buildClock(start) {
  let now = start;
  return { now: () => now, advance: (ms) => { now += ms; } };
}

describe('M21 — Cache Engine', () => {
  it('cria o engine com opções padrão', () => {
    const engine = createCacheEngine();
    assert.ok(engine instanceof CacheEngine);
  });

  it('criar engine com clock inválido lança CacheError MAK-L3-CACHE-001', () => {
    assert.throws(
      () => createCacheEngine({ clock: 'not-a-function' }),
      (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-001',
    );
  });

  it('set/get/has/delete funcionam no namespace padrão', async () => {
    const engine = createCacheEngine();
    await engine.set('user', { name: 'Ana' });

    assert.deepEqual(await engine.get('user'), { name: 'Ana' });
    assert.equal(await engine.has('user'), true);

    await engine.delete('user');
    assert.equal(await engine.get('user'), null);
    assert.equal(await engine.has('user'), false);
  });

  it('get() de chave inexistente retorna null, sem lançar', async () => {
    const engine = createCacheEngine();
    assert.equal(await engine.get('missing'), null);
  });

  it('clear() sem argumento limpa todo o cache; com namespace limpa só aquele namespace', async () => {
    const engine = createCacheEngine();
    await engine.set('a', 1);
    await engine.namespace('ns1').set('b', 2);

    await engine.clear('ns1');
    assert.equal(await engine.namespace('ns1').get('b'), null);
    assert.equal(await engine.get('a'), 1);

    await engine.clear();
    assert.equal(await engine.get('a'), null);
  });

  it('namespace() isola chaves entre namespaces diferentes', async () => {
    const engine = createCacheEngine();
    const nsA = engine.namespace('routeA');
    const nsB = engine.namespace('routeB');

    await nsA.set('filter', 'foo');
    await nsB.set('filter', 'bar');

    assert.equal(await nsA.get('filter'), 'foo');
    assert.equal(await nsB.get('filter'), 'bar');
  });

  it('instâncias diferentes não compartilham cache', async () => {
    const engineA = createCacheEngine();
    const engineB = createCacheEngine();
    await engineA.set('key', 'a-value');

    assert.equal(await engineA.get('key'), 'a-value');
    assert.equal(await engineB.get('key'), null);
  });

  it('snapshot() retorna cópia segura agrupada por namespace', async () => {
    const engine = createCacheEngine();
    await engine.set('a', 1);
    await engine.namespace('ns1').set('b', 2);

    const snap = engine.snapshot();
    assert.deepEqual(snap, { default: { a: 1 }, ns1: { b: 2 } });
  });

  it('mutar o snapshot retornado NÃO altera o cache interno', async () => {
    const engine = createCacheEngine();
    await engine.set('list', [1, 2]);

    const snap = engine.snapshot();
    snap.default.list.push(3);
    snap.default.mutated = true;

    assert.deepEqual(await engine.get('list'), [1, 2]);
    assert.equal(await engine.get('mutated'), null);
  });

  it('mutar o valor retornado por get() NÃO altera o cache interno', async () => {
    const engine = createCacheEngine();
    await engine.set('list', [1, 2]);

    const value = await engine.get('list');
    value.push(3);

    assert.deepEqual(await engine.get('list'), [1, 2]);
  });

  it('TTL expira o item de forma determinística usando clock controlado', async () => {
    const clock = buildClock(1000);
    const engine = createCacheEngine({ clock: clock.now });

    await engine.set('session', 'active', { ttlMs: 500 });
    assert.equal(await engine.get('session'), 'active');

    clock.advance(499);
    assert.equal(await engine.get('session'), 'active');

    clock.advance(2);
    assert.equal(await engine.get('session'), null);
  });

  it('set() aceita ttlSeconds posicional (SSOT-literal)', async () => {
    const clock = buildClock(0);
    const engine = createCacheEngine({ clock: clock.now });

    await engine.set('pin', 'abc', 1); // 1 second
    assert.equal(await engine.get('pin'), 'abc');

    clock.advance(1001);
    assert.equal(await engine.get('pin'), null);
  });

  it('chave inválida falha com CacheError MAK-L3-CACHE-002', async () => {
    const engine = createCacheEngine();
    await assert.rejects(() => engine.get(''), (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-002');
    await assert.rejects(() => engine.get(123), (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-002');
    await assert.rejects(
      () => engine.set('__proto__', 1),
      (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-002',
    );
  });

  it('namespace inválido falha com CacheError MAK-L3-CACHE-003', () => {
    const engine = createCacheEngine();
    assert.throws(
      () => engine.namespace(''),
      (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-003',
    );
    assert.throws(
      () => engine.namespace('constructor'),
      (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-003',
    );
  });

  it('limite de entradas falha com CacheError MAK-L3-CACHE-005', async () => {
    const engine = createCacheEngine();
    await assert.rejects(async () => {
      for (let i = 0; i < 1200; i += 1) {
        await engine.set(`key${i}`, i);
      }
    }, (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-005');
  });

  it('limite de profundidade de valor falha com CacheError MAK-L3-CACHE-004', async () => {
    const engine = createCacheEngine();
    let deepValue = { leaf: true };
    for (let i = 0; i < 12; i += 1) deepValue = { nested: deepValue };

    await assert.rejects(
      () => engine.set('deep', deepValue),
      (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-004',
    );
  });

  it('prototype pollution no valor armazenado é bloqueado (MAK-L3-CACHE-004)', async () => {
    const engine = createCacheEngine();
    const polluted = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => engine.set('x', polluted),
      (err) => err instanceof CacheError && err.code === 'MAK-L3-CACHE-004',
    );
  });

  it('não usa localStorage/sessionStorage/IndexedDB no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/cache/cacheEngine.js'), 'utf8');
    // Strip comments — the module's own JSDoc documents *why* these APIs are forbidden, which
    // otherwise reads as a false-positive match.
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/localStorage/.test(codeOnly), false);
    assert.equal(/sessionStorage/.test(codeOnly), false);
    assert.equal(/indexedDB/i.test(codeOnly), false);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/cache/cacheEngine.js'), 'utf8');
    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não cria Transaction Engine', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../infra/cache/cacheEngine.js'), 'utf8');
    assert.equal(/transactionEngine|TransactionEngine|TransactionManager/.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/transaction')), false);
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const engine = createCacheEngine();
    const locator = createServiceLocator();
    locator.register('cacheEngine', () => engine);

    assert.strictEqual(locator.resolve('cacheEngine'), engine);
  });
});

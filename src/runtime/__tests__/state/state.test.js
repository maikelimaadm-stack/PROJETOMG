import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createStateEngine, StateEngine } from '../../core/state/stateEngine.js';
import { StateError } from '../../core/state/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

describe('M17 — State Engine', () => {
  it('cria o engine com estado inicial padrão (vazio)', () => {
    const engine = createStateEngine();
    assert.ok(engine instanceof StateEngine);
    assert.deepEqual(engine.snapshot(), {});
  });

  it('cria o engine com estado inicial válido', () => {
    const engine = createStateEngine({ initialState: { screen: { count: 0 } } });
    assert.equal(engine.get('screen.count'), 0);
  });

  it('estado inicial inválido (não-objeto) falha com StateError MAK-L3-STATE-001', () => {
    assert.throws(
      () => createStateEngine({ initialState: 'not-an-object' }),
      (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-001',
    );
    assert.throws(
      () => createStateEngine({ initialState: [] }),
      (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-001',
    );
    assert.throws(
      () => createStateEngine({ initialState: null }),
      (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-001',
    );
  });

  it('get() lê um valor sem produzir side effect', () => {
    const engine = createStateEngine({ initialState: { user: { name: 'Ana' } } });
    const before = engine.snapshot();
    const value = engine.get('user.name');
    assert.equal(value, 'Ana');
    assert.deepEqual(engine.snapshot(), before);
  });

  it('get() retorna undefined para path inexistente, sem lançar', () => {
    const engine = createStateEngine();
    assert.equal(engine.get('missing.path'), undefined);
  });

  it('set() escreve um valor, criando caminhos intermediários', () => {
    const engine = createStateEngine();
    engine.set('user.profile.name', 'Bruno');
    assert.equal(engine.get('user.profile.name'), 'Bruno');
  });

  it('patch() atualiza parcialmente sem destruir estado não relacionado', () => {
    const engine = createStateEngine({ initialState: { user: { name: 'Ana', age: 30 }, other: { x: 1 } } });
    engine.patch({ user: { age: 31 } });
    assert.equal(engine.get('user.name'), 'Ana');
    assert.equal(engine.get('user.age'), 31);
    assert.equal(engine.get('other.x'), 1);
  });

  it('reset() sem argumento volta ao estado inicial completo', () => {
    const engine = createStateEngine({ initialState: { count: 0 } });
    engine.set('count', 99);
    engine.set('extra', 'x');
    engine.reset();
    assert.equal(engine.get('count'), 0);
    assert.equal(engine.get('extra'), undefined);
  });

  it('reset(path) volta apenas aquele caminho ao valor inicial', () => {
    const engine = createStateEngine({ initialState: { user: { name: 'Ana' }, screen: { count: 0 } } });
    engine.set('user.name', 'Changed');
    engine.set('screen.count', 5);
    engine.reset('user.name');
    assert.equal(engine.get('user.name'), 'Ana');
    assert.equal(engine.get('screen.count'), 5);
  });

  it('snapshot() retorna uma cópia segura do estado', () => {
    const engine = createStateEngine({ initialState: { a: 1 } });
    const snap = engine.snapshot();
    assert.deepEqual(snap, { a: 1 });
  });

  it('mutar o snapshot retornado NÃO altera o estado interno do engine', () => {
    const engine = createStateEngine({ initialState: { list: [1, 2, 3] } });
    const snap = engine.snapshot();
    snap.list.push(4);
    snap.newKey = 'mutated';
    assert.deepEqual(engine.get('list'), [1, 2, 3]);
    assert.equal(engine.get('newKey'), undefined);
  });

  it('path/chave inválido falha com StateError MAK-L3-STATE-002', () => {
    const engine = createStateEngine();
    assert.throws(() => engine.get(''), (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-002');
    assert.throws(() => engine.get(123), (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-002');
    assert.throws(
      () => engine.set('__proto__.polluted', true),
      (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-002',
    );
    assert.throws(
      () => engine.set('a.constructor.b', true),
      (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-002',
    );
  });

  it('operação de transição desconhecida falha com StateError MAK-L3-STATE-005', async () => {
    const engine = createStateEngine();
    await assert.rejects(
      () => engine.transition('screenA', { type: 'unknown_op' }),
      (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-005',
    );
  });

  it('transition() suporta set/patch/reset de forma isolada por entidade', async () => {
    const engine = createStateEngine({ initialState: { screenA: { count: 0 } } });
    const afterSet = await engine.transition('screenA', { type: 'set', value: { count: 10 } });
    assert.deepEqual(afterSet, { count: 10 });

    const afterPatch = await engine.transition('screenA', { type: 'patch', value: { extra: true } });
    assert.deepEqual(afterPatch, { count: 10, extra: true });

    const afterReset = await engine.transition('screenA', { type: 'reset' });
    assert.deepEqual(afterReset, { count: 0 });
  });

  it('estado é isolado entre duas instâncias diferentes', () => {
    const engineA = createStateEngine({ initialState: { count: 1 } });
    const engineB = createStateEngine({ initialState: { count: 1 } });
    engineA.set('count', 100);
    assert.equal(engineA.get('count'), 100);
    assert.equal(engineB.get('count'), 1);
  });

  it('scope() isola leitura/escrita por namespace dentro do mesmo engine', () => {
    const engine = createStateEngine();
    const routeA = engine.scope('routeA');
    const routeB = engine.scope('routeB');

    routeA.set('filters.search', 'foo');
    routeB.set('filters.search', 'bar');

    assert.equal(routeA.get('filters.search'), 'foo');
    assert.equal(routeB.get('filters.search'), 'bar');
    assert.equal(engine.get('routeA.filters.search'), 'foo');
    assert.equal(engine.get('routeB.filters.search'), 'bar');
  });

  it('subscribe() notifica listeners quando o path observado muda', () => {
    const engine = createStateEngine({ initialState: { count: 0 } });
    const seen = [];
    const unsubscribe = engine.subscribe('count', (value) => seen.push(value));

    engine.set('count', 1);
    engine.set('count', 2);
    unsubscribe();
    engine.set('count', 3);

    assert.deepEqual(seen, [1, 2]);
  });

  it('limite de profundidade de path falha com StateError MAK-L3-STATE-004', () => {
    const engine = createStateEngine();
    const deepPath = Array.from({ length: 20 }, (_, i) => `level${i}`).join('.');
    assert.throws(() => engine.set(deepPath, 1), (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-004');
  });

  it('limite de estado exagerado (número de chaves) falha com StateError MAK-L3-STATE-004', () => {
    const engine = createStateEngine();
    assert.throws(() => {
      for (let i = 0; i < 400; i += 1) {
        engine.set(`key${i}`, i);
      }
    }, (err) => err instanceof StateError && err.code === 'MAK-L3-STATE-004');
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const engine = createStateEngine();
    const locator = createServiceLocator();
    locator.register('stateEngine', () => engine);

    assert.strictEqual(locator.resolve('stateEngine'), engine);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/state/stateEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não cria Transaction Engine nem Cache/Event Bus', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/state/stateEngine.js'), 'utf8');

    assert.equal(/transactionEngine|TransactionEngine|TransactionManager/.test(source), false);
    assert.equal(/eventBus|EventBus|cacheEngine|CacheEngine/.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/transaction')), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/cache')), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/event-bus')), false);
  });

  it('não cria Plugin/Connector Engine e não importa React (sem UI de produção)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/state/stateEngine.js'), 'utf8');

    assert.equal(/pluginEngine|PluginEngine|connectorEngine|ConnectorEngine/.test(source), false);
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/plugin')), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/connector')), false);
  });

  it('não usa eval nem new Function no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/state/stateEngine.js'), 'utf8');
    assert.equal(/\beval\s*\(/.test(source), false);
    assert.equal(/new\s+Function\s*\(/.test(source), false);
  });
});

describe('M17 — State Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve o stateEngine já registrado no pipeline e opera de forma isolada', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.stateEngine);

    result.stateEngine.set('empresas.filters.search', 'acme');
    assert.equal(result.stateEngine.get('empresas.filters.search'), 'acme');
  });
});

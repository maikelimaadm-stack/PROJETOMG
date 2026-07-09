import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createConnectorEngine, ConnectorEngine } from '../../core/connector/connectorEngine.js';
import { ConnectorError } from '../../core/connector/errors.js';
import { createPermissionEngine } from '../../core/permission/permissionEngine.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** @param {string[]} permissions */
function buildCtx(permissions) {
  return { accessScope: { tenantId: 't1', userId: 'u1', companies: [], permissions, locale: 'pt-BR' } };
}

/**
 * @param {{id: string, payload?: Object}[]} connectors
 * @param {{code: string, payload?: Object}[]} [permissions]
 */
function buildRegistry(connectors = [], permissions = []) {
  const registry = createRegistry();
  for (const entry of connectors) {
    registry.register('connector', entry.id, () => ({ objectId: entry.id, objectType: 'integration', payload: entry.payload ?? {} }));
  }
  for (const entry of permissions) {
    registry.register('permission', entry.code, () => ({ code: entry.code, objectType: 'permission', payload: entry.payload ?? {} }));
  }
  registry.freeze();
  return registry;
}

describe('M19 — Connector Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildRegistry();
    const engine = createConnectorEngine({ registry });
    assert.ok(engine instanceof ConnectorEngine);
  });

  it('criar engine sem registry válido lança ConnectorError MAK-L3-CONNECTOR-001', () => {
    assert.throws(
      () => createConnectorEngine({}),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-001',
    );
  });

  it('resolve() carrega um connector declarado no registry/CRB', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry });

    const connector = await engine.resolve('http_connector');
    assert.equal(connector.connectorId, 'http_connector');
    assert.deepEqual(connector.operations, ['export']);
    assert.equal(connector.enabled, true);
  });

  it('resolve() de connector inexistente falha com ConnectorError MAK-L3-CONNECTOR-002', async () => {
    const registry = buildRegistry();
    const engine = createConnectorEngine({ registry });

    await assert.rejects(
      () => engine.resolve('missing-connector'),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-002',
    );
  });

  it('load() com manifest de shape inválido falha com ConnectorError MAK-L3-CONNECTOR-003', async () => {
    const registry = buildRegistry();
    const engine = createConnectorEngine({ registry });

    await assert.rejects(
      () => engine.load({ connectorId: '', operations: [] }),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-003',
    );
    await assert.rejects(
      () => engine.load({ connectorId: 'x', operations: 'not-an-array' }),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-003',
    );
    await assert.rejects(
      () => engine.load(null),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-003',
    );
  });

  it('connector desabilitado bloqueia execução (MAK-L3-CONNECTOR-005)', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'], enabled: false } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });
    let executed = false;
    engine.registerAdapter('http_connector', 'export', async () => {
      executed = true;
      return { ok: true };
    });

    const result = await engine.invoke('http_connector', { operation: 'export', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-CONNECTOR-005');
    assert.equal(executed, false);
  });

  it('operation válida executa via adapter host-registrado e retorna resultado de sucesso', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });
    engine.registerAdapter('http_connector', 'export', async (payload) => ({ exported: payload.id }));

    const result = await engine.invoke('http_connector', { operation: 'export', payload: { id: 42 } }, buildCtx([]));
    assert.equal(result.success, true);
    assert.deepEqual(result.data, { exported: 42 });
  });

  it('operation desconhecida (não é um Host Adapter Registry entry) falha com ConnectorError MAK-L3-CONNECTOR-004', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });

    await assert.rejects(
      () => engine.invoke('http_connector', { operation: 'not_a_real_operation', payload: {} }, buildCtx([])),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-004',
    );
  });

  it('operation conhecida mas não permitida para o connector bloqueia (MAK-L3-CONNECTOR-006)', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export', 'import'] });
    let executed = false;
    engine.registerAdapter('http_connector', 'import', async () => {
      executed = true;
      return { ok: true };
    });

    const result = await engine.invoke('http_connector', { operation: 'import', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-CONNECTOR-006');
    assert.equal(executed, false);
  });

  it('connector com permissão concedida executa normalmente', async () => {
    const registry = buildRegistry(
      [{ id: 'http_connector', payload: { operations: ['export'], permission: 'http_connector.export' } }],
      [{ code: 'http_connector.export', payload: { effect: 'allow' } }],
    );
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createConnectorEngine({ registry, permissionEngine, operations: ['export'] });
    engine.registerAdapter('http_connector', 'export', async () => ({ ok: true }));

    const result = await engine.invoke('http_connector', { operation: 'export', payload: {} }, buildCtx(['http_connector.export']));
    assert.equal(result.success, true);
  });

  it('connector com permissão negada bloqueia execução (MAK-L3-CONNECTOR-008)', async () => {
    const registry = buildRegistry([
      { id: 'http_connector', payload: { operations: ['export'], permission: 'http_connector.export' } },
    ]);
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createConnectorEngine({ registry, permissionEngine, operations: ['export'] });
    let executed = false;
    engine.registerAdapter('http_connector', 'export', async () => {
      executed = true;
      return { ok: true };
    });

    const result = await engine.invoke('http_connector', { operation: 'export', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-CONNECTOR-008');
    assert.equal(executed, false);
  });

  it('ausência de Permission Engine quando permissão é exigida falha de forma previsível (MAK-L3-CONNECTOR-007)', async () => {
    const registry = buildRegistry([
      { id: 'http_connector', payload: { operations: ['export'], permission: 'http_connector.export' } },
    ]);
    const engine = createConnectorEngine({ registry, operations: ['export'] }); // no permissionEngine wired
    engine.registerAdapter('http_connector', 'export', async () => ({ ok: true }));

    const result = await engine.invoke('http_connector', { operation: 'export', payload: {} }, buildCtx(['http_connector.export']));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-CONNECTOR-007');
  });

  it('ausência de adapter obrigatório falha de forma previsível (MAK-L3-CONNECTOR-007)', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });

    const result = await engine.invoke('http_connector', { operation: 'export', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-CONNECTOR-007');
  });

  it('payload inválido (request malformado) falha com ConnectorError MAK-L3-CONNECTOR-003', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });

    await assert.rejects(
      () => engine.invoke('http_connector', {}, buildCtx([])),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-003',
    );
    await assert.rejects(
      () => engine.invoke('http_connector', null, buildCtx([])),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-003',
    );
  });

  it('payload acima do limite de chaves falha com ConnectorError MAK-L3-CONNECTOR-009', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });
    engine.registerAdapter('http_connector', 'export', async () => ({ ok: true }));

    const bigPayload = {};
    for (let i = 0; i < 300; i += 1) bigPayload[`key${i}`] = i;

    await assert.rejects(
      () => engine.invoke('http_connector', { operation: 'export', payload: bigPayload }, buildCtx([])),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-009',
    );
  });

  it('manifest com operations acima do limite falha com ConnectorError MAK-L3-CONNECTOR-009', async () => {
    const registry = buildRegistry();
    const engine = createConnectorEngine({ registry });

    const tooManyOps = Array.from({ length: 100 }, (_, i) => `op${i}`);
    await assert.rejects(
      () => engine.load({ connectorId: 'x', operations: tooManyOps }),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-009',
    );
  });

  it('prototype pollution no payload é bloqueado (MAK-L3-CONNECTOR-009)', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });
    engine.registerAdapter('http_connector', 'export', async () => ({ ok: true }));

    const pollutedPayload = JSON.parse('{"__proto__": {"polluted": true}}');
    await assert.rejects(
      () => engine.invoke('http_connector', { operation: 'export', payload: pollutedPayload }, buildCtx([])),
      (err) => err instanceof ConnectorError && err.code === 'MAK-L3-CONNECTOR-009',
    );
  });

  it('resultado sensível é redigido (token/secret mascarados)', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });
    engine.registerAdapter('http_connector', 'export', async () => ({ token: 'abc123', ok: true }));

    const result = await engine.invoke('http_connector', { operation: 'export', payload: {} }, buildCtx([]));
    assert.equal(result.success, true);
    assert.equal(result.data.token, '[REDACTED]');
    assert.equal(result.data.ok, true);
  });

  it('falha do adapter retorna erro controlado (sem lançar) — MAK-L3-CONNECTOR-010', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });
    engine.registerAdapter('http_connector', 'export', async () => {
      throw new Error('network unreachable');
    });

    const result = await engine.invoke('http_connector', { operation: 'export', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-CONNECTOR-010');
  });

  it('resultado determinístico para a mesma entrada', async () => {
    const registry = buildRegistry([{ id: 'http_connector', payload: { operations: ['export'] } }]);
    const engine = createConnectorEngine({ registry, operations: ['export'] });
    engine.registerAdapter('http_connector', 'export', async (payload) => ({ exported: payload.id }));

    const first = await engine.invoke('http_connector', { operation: 'export', payload: { id: 7 } }, buildCtx([]));
    const second = await engine.invoke('http_connector', { operation: 'export', payload: { id: 7 } }, buildCtx([]));
    assert.deepEqual(first, second);
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildRegistry();
    const engine = createConnectorEngine({ registry });
    const locator = createServiceLocator();
    locator.register('connectorEngine', () => engine);

    assert.strictEqual(locator.resolve('connectorEngine'), engine);
  });

  it('não usa eval no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/connector/connectorEngine.js'), 'utf8');
    assert.equal(/\beval\s*\(/.test(source), false);
  });

  it('não usa new Function no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/connector/connectorEngine.js'), 'utf8');
    assert.equal(/new\s+Function\s*\(/.test(source), false);
  });

  it('não usa import dinâmico inseguro no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/connector/connectorEngine.js'), 'utf8');
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/\bimport\s*\(/.test(codeOnly), false);
  });

  it('não usa fetch direto no core connector', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/connector/connectorEngine.js'), 'utf8');
    // Strip comments — the module's own JSDoc documents *why* fetch() is forbidden, which
    // otherwise reads as a false-positive match.
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/\bfetch\s*\(/.test(codeOnly), false);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/connector/connectorEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não cria Cache/Event Bus nem Transaction Engine, e não importa React (sem UI de produção)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/connector/connectorEngine.js'), 'utf8');

    assert.equal(/eventBus|EventBus|cacheEngine|CacheEngine|transactionEngine|TransactionEngine/.test(source), false);
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/cache')), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/event-bus')), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/transaction')), false);
  });
});

describe('M19 — Connector Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve o connector declarado na fixture CRB (http_connector) via registry hidratado', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.connectorEngine);

    const connector = await result.connectorEngine.resolve('int-1');
    assert.equal(connector.connectorId, 'int-1');
  });
});

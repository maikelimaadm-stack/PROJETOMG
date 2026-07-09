import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createPluginEngine, PluginEngine } from '../../core/plugin/pluginEngine.js';
import { PluginError } from '../../core/plugin/errors.js';
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
 * @param {{id: string, payload?: Object}[]} plugins
 * @param {{code: string, payload?: Object}[]} [permissions]
 */
function buildRegistry(plugins = [], permissions = []) {
  const registry = createRegistry();
  for (const entry of plugins) {
    registry.register('plugin', entry.id, () => ({ objectId: entry.id, objectType: 'plugin', payload: entry.payload ?? {} }));
  }
  for (const entry of permissions) {
    registry.register('permission', entry.code, () => ({ code: entry.code, objectType: 'permission', payload: entry.payload ?? {} }));
  }
  registry.freeze();
  return registry;
}

describe('M18 — Plugin Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildRegistry();
    const engine = createPluginEngine({ registry });
    assert.ok(engine instanceof PluginEngine);
  });

  it('criar engine sem registry válido lança PluginError MAK-L3-PLUGIN-001', () => {
    assert.throws(
      () => createPluginEngine({}),
      (err) => err instanceof PluginError && err.code === 'MAK-L3-PLUGIN-001',
    );
  });

  it('resolve() carrega um plugin declarado no registry/CRB', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry });

    const plugin = await engine.resolve('plugin-1');
    assert.equal(plugin.pluginId, 'plugin-1');
    assert.deepEqual(plugin.capabilities, ['export']);
    assert.equal(plugin.enabled, true);
  });

  it('resolve() de plugin inexistente falha com PluginError MAK-L3-PLUGIN-002', async () => {
    const registry = buildRegistry();
    const engine = createPluginEngine({ registry });

    await assert.rejects(
      () => engine.resolve('missing-plugin'),
      (err) => err instanceof PluginError && err.code === 'MAK-L3-PLUGIN-002',
    );
  });

  it('load() com manifest de shape inválido falha com PluginError MAK-L3-PLUGIN-003', async () => {
    const registry = buildRegistry();
    const engine = createPluginEngine({ registry });

    await assert.rejects(
      () => engine.load({ pluginId: '', capabilities: [] }),
      (err) => err instanceof PluginError && err.code === 'MAK-L3-PLUGIN-003',
    );
    await assert.rejects(
      () => engine.load({ pluginId: 'x', capabilities: 'not-an-array' }),
      (err) => err instanceof PluginError && err.code === 'MAK-L3-PLUGIN-003',
    );
    await assert.rejects(
      () => engine.load(null),
      (err) => err instanceof PluginError && err.code === 'MAK-L3-PLUGIN-003',
    );
  });

  it('unload() remove o plugin carregado e seus handlers', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });
    engine.registerHandler('plugin-1', 'export', async () => ({ ok: true }));
    await engine.resolve('plugin-1');

    await engine.unload('plugin-1');
    const result = await engine.execute('plugin-1', 'export', {}, buildCtx([]));
    // After unload, resolve() runs again from the registry (still declared there) but the handler is gone.
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-PLUGIN-007');
  });

  it('getExtensionPoint() retorna o extension point registrado e lança para nome desconhecido', () => {
    const registry = buildRegistry();
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });

    assert.deepEqual(engine.getExtensionPoint('export'), { name: 'export' });
    assert.throws(
      () => engine.getExtensionPoint('unknown_point'),
      (err) => err instanceof PluginError && err.code === 'MAK-L3-PLUGIN-004',
    );
  });

  it('plugin desabilitado bloqueia execução (MAK-L3-PLUGIN-005)', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'], enabled: false } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });
    let executed = false;
    engine.registerHandler('plugin-1', 'export', async () => {
      executed = true;
      return { ok: true };
    });

    const result = await engine.execute('plugin-1', 'export', {}, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-PLUGIN-005');
    assert.equal(executed, false);
  });

  it('capability válida executa e retorna resultado de sucesso', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });
    engine.registerHandler('plugin-1', 'export', async (payload) => ({ exported: payload.id }));

    const result = await engine.execute('plugin-1', 'export', { id: 42 }, buildCtx([]));
    assert.equal(result.success, true);
    assert.deepEqual(result.data, { exported: 42 });
  });

  it('capability desconhecida (não é um extension point) falha com PluginError MAK-L3-PLUGIN-004', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });

    await assert.rejects(
      () => engine.execute('plugin-1', 'not_a_real_extension_point', {}, buildCtx([])),
      (err) => err instanceof PluginError && err.code === 'MAK-L3-PLUGIN-004',
    );
  });

  it('capability conhecida mas não permitida para o plugin bloqueia (MAK-L3-PLUGIN-006)', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export', 'import'] });
    let executed = false;
    engine.registerHandler('plugin-1', 'import', async () => {
      executed = true;
      return { ok: true };
    });

    const result = await engine.execute('plugin-1', 'import', {}, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-PLUGIN-006');
    assert.equal(executed, false);
  });

  it('plugin com permissão concedida executa normalmente', async () => {
    const registry = buildRegistry(
      [{ id: 'plugin-1', payload: { capabilities: ['export'], permission: 'empresas_plugin.export' } }],
      [{ code: 'empresas_plugin.export', payload: { effect: 'allow' } }],
    );
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createPluginEngine({ registry, permissionEngine, extensionPoints: ['export'] });
    engine.registerHandler('plugin-1', 'export', async () => ({ ok: true }));

    const result = await engine.execute('plugin-1', 'export', {}, buildCtx(['empresas_plugin.export']));
    assert.equal(result.success, true);
  });

  it('plugin com permissão negada bloqueia execução (MAK-L3-PLUGIN-008)', async () => {
    const registry = buildRegistry([
      { id: 'plugin-1', payload: { capabilities: ['export'], permission: 'empresas_plugin.export' } },
    ]);
    const permissionEngine = createPermissionEngine({ registry });
    const engine = createPluginEngine({ registry, permissionEngine, extensionPoints: ['export'] });
    let executed = false;
    engine.registerHandler('plugin-1', 'export', async () => {
      executed = true;
      return { ok: true };
    });

    const result = await engine.execute('plugin-1', 'export', {}, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-PLUGIN-008');
    assert.equal(executed, false);
  });

  it('ausência de Permission Engine quando permissão é exigida falha de forma previsível (MAK-L3-PLUGIN-007)', async () => {
    const registry = buildRegistry([
      { id: 'plugin-1', payload: { capabilities: ['export'], permission: 'empresas_plugin.export' } },
    ]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] }); // no permissionEngine wired
    engine.registerHandler('plugin-1', 'export', async () => ({ ok: true }));

    const result = await engine.execute('plugin-1', 'export', {}, buildCtx(['empresas_plugin.export']));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-PLUGIN-007');
  });

  it('ausência de handler bound falha de forma previsível (MAK-L3-PLUGIN-007)', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });

    const result = await engine.execute('plugin-1', 'export', {}, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-PLUGIN-007');
  });

  it('falha do handler retorna erro controlado (sem lançar) — MAK-L3-PLUGIN-009', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });
    engine.registerHandler('plugin-1', 'export', async () => {
      throw new Error('boom');
    });

    const result = await engine.execute('plugin-1', 'export', {}, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-PLUGIN-009');
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildRegistry();
    const engine = createPluginEngine({ registry });
    const locator = createServiceLocator();
    locator.register('pluginEngine', () => engine);

    assert.strictEqual(locator.resolve('pluginEngine'), engine);
  });

  it('resultado determinístico para a mesma entrada', async () => {
    const registry = buildRegistry([{ id: 'plugin-1', payload: { capabilities: ['export'] } }]);
    const engine = createPluginEngine({ registry, extensionPoints: ['export'] });
    engine.registerHandler('plugin-1', 'export', async (payload) => ({ exported: payload.id }));

    const first = await engine.execute('plugin-1', 'export', { id: 7 }, buildCtx([]));
    const second = await engine.execute('plugin-1', 'export', { id: 7 }, buildCtx([]));
    assert.deepEqual(first, second);
  });

  it('não usa eval no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/plugin/pluginEngine.js'), 'utf8');
    assert.equal(/\beval\s*\(/.test(source), false);
  });

  it('não usa new Function no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/plugin/pluginEngine.js'), 'utf8');
    assert.equal(/new\s+Function\s*\(/.test(source), false);
  });

  it('não usa import dinâmico inseguro no código-fonte', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/plugin/pluginEngine.js'), 'utf8');
    // Strip comments first — JSDoc type annotations legitimately use `import('./x.js').Type`,
    // which is a type-only reference, not an executable dynamic import().
    const codeOnly = source.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '');
    assert.equal(/\bimport\s*\(/.test(codeOnly), false);
  });

  it('não importa Prisma/backend direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/plugin/pluginEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('pluginEngine.js não referencia Connector/Transaction Engine nem Cache/Event Bus, e não importa React (sem UI de produção)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/plugin/pluginEngine.js'), 'utf8');

    // M19 Connector Engine exists (C.14) — scoped to "pluginEngine.js itself never references it",
    // not "core/connector/ must not exist" (that was only valid during C.13's own authoring).
    assert.equal(/connectorEngine|ConnectorEngine|transactionEngine|TransactionEngine|eventBus|EventBus|cacheEngine|CacheEngine/.test(source), false);
    assert.equal(/from\s+['"]react['"]/i.test(source), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/transaction')), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/cache')), false);
    assert.equal(fs.existsSync(path.join(dir, '../../core/event-bus')), false);
  });
});

describe('M18 — Plugin Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve o plugin declarado na fixture CRB (empresas_plugin) via registry hidratado', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.pluginEngine);

    const plugin = await result.pluginEngine.resolve('plugin-1');
    assert.equal(plugin.pluginId, 'plugin-1');
  });
});

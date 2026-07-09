import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createPermissionEngine } from '../../core/permission/permissionEngine.js';
import { createActionEngine, ActionEngine } from '../../core/action/actionEngine.js';
import { ActionError } from '../../core/action/errors.js';
import { createServiceLocator } from '../../infra/service-locator/serviceLocator.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** @param {{code: string, payload?: Object}[]} entries */
function buildActionRegistry(entries) {
  const registry = createRegistry();
  for (const entry of entries) {
    registry.register('action', entry.code, () => ({ ...entry }));
  }
  registry.freeze();
  return registry;
}

/** @param {{code: string, payload: {effect: string}}[]} entries */
function buildPermissionRegistry(entries) {
  const registry = createRegistry();
  for (const entry of entries) {
    registry.register('permission', entry.code, () => ({ ...entry }));
  }
  registry.freeze();
  return registry;
}

/** @param {string[]} permissions */
function buildCtx(permissions) {
  return {
    accessScope: {
      tenantId: 'tenant-a',
      userId: 'user-1',
      companies: [],
      permissions,
      locale: 'pt-BR',
    },
  };
}

describe('M10 — Action Engine', () => {
  it('cria o engine com registry válido', () => {
    const registry = buildActionRegistry([]);
    const engine = createActionEngine({ registry });
    assert.ok(engine instanceof ActionEngine);
  });

  it('criar engine sem registry válido lança ActionError MAK-L3-ACTION-001', () => {
    assert.throws(
      () => createActionEngine({}),
      (err) => err instanceof ActionError && err.code === 'MAK-L3-ACTION-001',
    );
  });

  it('bind() registra e has() resolve ação vinculada', () => {
    const registry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'empresa.save', payload: {} }]);
    const engine = createActionEngine({ registry });
    engine.bind('empresa.save', async () => 'ok');

    assert.equal(engine.has('empresa.save'), true);
    assert.equal(engine.has('empresa.other'), false);
  });

  it('bind() com actionId ou handler inválido lança ActionError MAK-L3-ACTION-002', () => {
    const registry = buildActionRegistry([]);
    const engine = createActionEngine({ registry });

    assert.throws(
      () => engine.bind('', async () => {}),
      (err) => err instanceof ActionError && err.code === 'MAK-L3-ACTION-002',
    );
    assert.throws(
      () => engine.bind('x', 'not-a-function'),
      (err) => err instanceof ActionError && err.code === 'MAK-L3-ACTION-002',
    );
  });

  it('dispatch() executa ação válida e retorna UecResult de sucesso', async () => {
    const registry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'empresa.save', payload: {} }]);
    const engine = createActionEngine({ registry });
    engine.bind('empresa.save', async (payload) => ({ savedId: payload.id }));

    const result = await engine.dispatch({ type: 'empresa.save', payload: { id: 42 } }, buildCtx([]));
    assert.equal(result.success, true);
    assert.deepEqual(result.data, { savedId: 42 });
  });

  it('dispatch() com ação inexistente (sem entry no registry) falha com MAK-L3-ACTION-004', async () => {
    const registry = buildActionRegistry([]);
    const engine = createActionEngine({ registry });

    const result = await engine.dispatch({ type: 'empresa.save', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-ACTION-004');
  });

  it('dispatch() sem handler bound (ação existe no registry mas nunca foi bind) falha com MAK-L3-ACTION-004', async () => {
    const registry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'empresa.save', payload: {} }]);
    const engine = createActionEngine({ registry });

    const result = await engine.dispatch({ type: 'empresa.save', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-ACTION-004');
  });

  it('dispatch() com tipo de comando ausente/inválido falha com MAK-L3-ACTION-003', async () => {
    const registry = buildActionRegistry([]);
    const engine = createActionEngine({ registry });

    const missingType = await engine.dispatch({ payload: {} }, buildCtx([]));
    assert.equal(missingType.success, false);
    assert.equal(missingType.error.code, 'MAK-L3-ACTION-003');

    const invalidKind = await engine.dispatch({ type: 'empresa.save', kind: 'query', payload: {} }, buildCtx([]));
    assert.equal(invalidKind.success, false);
    assert.equal(invalidKind.error.code, 'MAK-L3-ACTION-003');
  });

  it('dispatch() com payload ausente (inválido) falha com MAK-L3-ACTION-003', async () => {
    const registry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'empresa.save', payload: {} }]);
    const engine = createActionEngine({ registry });
    engine.bind('empresa.save', async () => 'ok');

    const result = await engine.dispatch({ type: 'empresa.save' }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-ACTION-003');
  });

  it('dispatch() com contexto inválido em ação que exige permissão falha com MAK-L3-ACTION-005 (fail-closed)', async () => {
    const registry = buildActionRegistry([
      { objectId: 'a1', objectType: 'action', code: 'empresa.delete', payload: { permission: 'empresa.delete' } },
    ]);
    const permissionEngine = createPermissionEngine({
      registry: buildPermissionRegistry([{ code: 'empresa.delete', payload: { effect: 'allow' } }]),
    });
    const engine = createActionEngine({ registry, permissionEngine });
    engine.bind('empresa.delete', async () => 'deleted');

    const result = await engine.dispatch({ type: 'empresa.delete', payload: {} }, {});
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-ACTION-005');
  });

  it('ação com permissão concedida executa', async () => {
    const registry = buildActionRegistry([
      { objectId: 'a1', objectType: 'action', code: 'empresa.delete', payload: { permission: 'empresa.delete' } },
    ]);
    const permissionEngine = createPermissionEngine({
      registry: buildPermissionRegistry([{ code: 'empresa.delete', payload: { effect: 'allow' } }]),
    });
    const engine = createActionEngine({ registry, permissionEngine });
    engine.bind('empresa.delete', async () => 'deleted');

    const result = await engine.dispatch({ type: 'empresa.delete', payload: {} }, buildCtx(['empresa.delete']));
    assert.equal(result.success, true);
    assert.equal(result.data, 'deleted');
  });

  it('ação com permissão negada não executa (handler nunca é chamado)', async () => {
    const registry = buildActionRegistry([
      { objectId: 'a1', objectType: 'action', code: 'empresa.delete', payload: { permission: 'empresa.delete' } },
    ]);
    const permissionEngine = createPermissionEngine({
      registry: buildPermissionRegistry([{ code: 'empresa.delete', payload: { effect: 'deny' } }]),
    });
    const engine = createActionEngine({ registry, permissionEngine });
    let executed = false;
    engine.bind('empresa.delete', async () => {
      executed = true;
      return 'deleted';
    });

    const result = await engine.dispatch({ type: 'empresa.delete', payload: {} }, buildCtx(['empresa.delete']));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-ACTION-005');
    assert.equal(executed, false);
  });

  it('handler que lança exceção retorna UecResult de falha (MAK-L3-ACTION-006), nunca propaga', async () => {
    const registry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'empresa.save', payload: {} }]);
    const engine = createActionEngine({ registry });
    engine.bind('empresa.save', async () => {
      throw new Error('boom');
    });

    const result = await engine.dispatch({ type: 'empresa.save', payload: {} }, buildCtx([]));
    assert.equal(result.success, false);
    assert.equal(result.error.code, 'MAK-L3-ACTION-006');
  });

  it('integra com o Service Locator (M20) quando aplicável', () => {
    const registry = buildActionRegistry([{ objectId: 'a1', objectType: 'action', code: 'empresa.save', payload: {} }]);
    const engine = createActionEngine({ registry });
    const locator = createServiceLocator();
    locator.register('actionEngine', () => engine);

    assert.strictEqual(locator.resolve('actionEngine'), engine);
  });

  it('não importa Prisma/backend/MMM direto (D-RI-13)', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/action/actionEngine.js'), 'utf8');

    assert.equal(/from\s+['"].*prisma.*['"]/i.test(source), false);
    assert.equal(/require\(.*prisma.*\)/i.test(source), false);
    assert.equal(/PrismaClient/.test(source), false);
    assert.equal(/from\s+['"].*backend.*['"]/i.test(source), false);
  });

  it('não aciona Workflow (M11) nem Render (M12) — fora de escopo do C.6', () => {
    const dir = path.dirname(fileURLToPath(import.meta.url));
    const source = fs.readFileSync(path.join(dir, '../../core/action/actionEngine.js'), 'utf8');

    assert.equal(/workflowEngine|WorkflowEngine|renderEngine|RenderEngine/.test(source), false);
  });
});

describe('M10 — Action Engine wired through loadRuntimeBundle (RT-3 pipeline)', () => {
  it('resolve e executa uma ação declarada na fixture CRB (empresa.save)', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    assert.ok(result.actionEngine);

    result.actionEngine.bind('empresa.save', async (payload) => ({ ok: true, payload }));

    const dispatchResult = await result.actionEngine.dispatch(
      { type: 'empresa.save', payload: { razao_social: 'Acme' } },
      buildCtx([]),
    );
    assert.equal(dispatchResult.success, true);
    assert.deepEqual(dispatchResult.data, { ok: true, payload: { razao_social: 'Acme' } });
  });

  it('ação não declarada na fixture CRB falha com MAK-L3-ACTION-004', async () => {
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    const dispatchResult = await result.actionEngine.dispatch({ type: 'empresa.nonexistent', payload: {} }, buildCtx([]));

    assert.equal(dispatchResult.success, false);
    assert.equal(dispatchResult.error.code, 'MAK-L3-ACTION-004');
  });
});

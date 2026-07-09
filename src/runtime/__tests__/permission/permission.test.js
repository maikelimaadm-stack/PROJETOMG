import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRegistry } from '../../core/registry/registryManager.js';
import { createPermissionEngine } from '../../core/permission/permissionEngine.js';
import { PermissionMatrix } from '../../core/permission/PermissionMatrix.js';
import { PermissionError } from '../../core/permission/errors.js';
import { createRuntimeRouter } from '../../core/router/runtimeRouter.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { createContext } from '../../core/context/createContext.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

/** @param {{code: string, payload: {effect: string}}[]} entries */
function buildRegistryWithPermissions(entries) {
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

describe('M09 — Permission Engine', () => {
  it('allow explícito + permissão concedida permite', async () => {
    const registry = buildRegistryWithPermissions([{ code: 'empresa.read', payload: { effect: 'allow' } }]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx(['empresa.read']);

    assert.equal(await engine.can('read', 'empresa', ctx), true);
  });

  it('deny explícito bloqueia mesmo com permissão concedida', async () => {
    const registry = buildRegistryWithPermissions([{ code: 'empresa.delete', payload: { effect: 'deny' } }]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx(['empresa.delete']);

    assert.equal(await engine.can('delete', 'empresa', ctx), false);
  });

  it('deny vence allow quando ambos são aplicáveis (wildcard allow + específico deny)', async () => {
    const registry = buildRegistryWithPermissions([
      { code: 'empresa.*', payload: { effect: 'allow' } },
      { code: 'empresa.delete', payload: { effect: 'deny' } },
    ]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx(['empresa.*', 'empresa.delete']);

    assert.equal(await engine.can('delete', 'empresa', ctx), false);
  });

  it('ausência de regra no registry bloqueia por default-deny', async () => {
    const registry = buildRegistryWithPermissions([]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx([]);

    assert.equal(await engine.can('read', 'empresa', ctx), false);
  });

  it('allow existe no registry mas usuário não tem a permissão concedida — bloqueia', async () => {
    const registry = buildRegistryWithPermissions([{ code: 'empresa.read', payload: { effect: 'allow' } }]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx([]);

    assert.equal(await engine.can('read', 'empresa', ctx), false);
  });

  it('contexto inválido (sem accessScope/permissions) bloqueia', async () => {
    const registry = buildRegistryWithPermissions([{ code: 'empresa.read', payload: { effect: 'allow' } }]);
    const engine = createPermissionEngine({ registry });

    assert.equal(await engine.can('read', 'empresa', {}), false);
    assert.equal(await engine.can('read', 'empresa', null), false);
    assert.equal(await engine.can('read', 'empresa', { accessScope: {} }), false);
  });

  it('action/resource inválidos bloqueiam', async () => {
    const registry = buildRegistryWithPermissions([{ code: 'empresa.read', payload: { effect: 'allow' } }]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx(['empresa.read']);

    assert.equal(await engine.can('', 'empresa', ctx), false);
    assert.equal(await engine.can('read', '', ctx), false);
    assert.equal(await engine.can(undefined, 'empresa', ctx), false);
  });

  it('criar engine sem registry válido lança PermissionError MAK-L3-PERMISSION-001', () => {
    assert.throws(
      () => createPermissionEngine({}),
      (err) => err instanceof PermissionError && err.code === 'MAK-L3-PERMISSION-001',
    );
    assert.throws(
      () => createPermissionEngine({ registry: {} }),
      (err) => err instanceof PermissionError && err.code === 'MAK-L3-PERMISSION-001',
    );
  });

  it('efeito de permissão inválido no registry lança PermissionError MAK-L3-PERMISSION-003', async () => {
    const registry = buildRegistryWithPermissions([{ code: 'empresa.read', payload: { effect: 'maybe' } }]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx(['empresa.read']);

    await assert.rejects(
      () => engine.can('read', 'empresa', ctx),
      (err) => err instanceof PermissionError && err.code === 'MAK-L3-PERMISSION-003',
    );
  });

  it('filterVisible remove itens negados e mantém permitidos + públicos', async () => {
    const registry = buildRegistryWithPermissions([
      { code: 'empresa.read', payload: { effect: 'allow' } },
      { code: 'empresa.delete', payload: { effect: 'deny' } },
    ]);
    const engine = createPermissionEngine({ registry });
    const ctx = buildCtx(['empresa.read']);

    const items = [
      { id: 'view-field', permission: 'empresa.read' },
      { id: 'delete-button', permission: 'empresa.delete' },
      { id: 'public-label' },
    ];

    const visible = await engine.filterVisible(items, ctx);
    assert.deepEqual(visible.map((item) => item.id), ['view-field', 'public-label']);
  });

  it('filterVisible exige array — lança PermissionError MAK-L3-PERMISSION-002', async () => {
    const registry = buildRegistryWithPermissions([]);
    const engine = createPermissionEngine({ registry });

    await assert.rejects(
      () => engine.filterVisible('not-an-array', buildCtx([])),
      (err) => err instanceof PermissionError && err.code === 'MAK-L3-PERMISSION-002',
    );
  });

  it('PermissionMatrix.evaluate expõe a decisão bruta (allow/not-granted/default-deny)', () => {
    const registry = buildRegistryWithPermissions([{ code: 'empresa.read', payload: { effect: 'allow' } }]);

    const allowed = PermissionMatrix.evaluate({
      action: 'read',
      resource: 'empresa',
      registry,
      grantedPermissions: ['empresa.read'],
    });
    assert.equal(allowed.allowed, true);
    assert.equal(allowed.reason, 'allow');

    const notGranted = PermissionMatrix.evaluate({
      action: 'read',
      resource: 'empresa',
      registry,
      grantedPermissions: [],
    });
    assert.equal(notGranted.allowed, false);
    assert.equal(notGranted.reason, 'not-granted');

    const defaultDeny = PermissionMatrix.evaluate({
      action: 'write',
      resource: 'empresa',
      registry,
      grantedPermissions: [],
    });
    assert.equal(defaultDeny.allowed, false);
    assert.equal(defaultDeny.reason, 'default-deny');
  });
});

describe('M09 — RT-5 Router canActivate()', () => {
  it('sem Permission Engine wired, bloqueia por fail-closed', async () => {
    const router = createRuntimeRouter();
    const allowed = await router.canActivate({ path: '/x', objectId: 'x', moduleId: 'empresas' }, {});
    assert.equal(allowed, false);
  });

  it('permite rota autorizada (allow + permissão concedida)', async () => {
    const crb = buildEmpresasCrbFixture({
      permissionEntries: [
        { objectId: 'perm-access', objectType: 'permission', code: 'empresas.access', payload: { effect: 'allow' } },
      ],
    });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    const route = result.router.match('/empresas', pin.applicationId, crb.moduleId);
    assert.ok(route);

    const ctx = buildCtx(['empresas.access']);
    assert.equal(await result.router.canActivate(route, ctx), true);
  });

  it('bloqueia rota negada (deny explícito)', async () => {
    const crb = buildEmpresasCrbFixture({
      permissionEntries: [
        { objectId: 'perm-access', objectType: 'permission', code: 'empresas.access', payload: { effect: 'deny' } },
      ],
    });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    const route = result.router.match('/empresas', pin.applicationId, crb.moduleId);

    const ctx = buildCtx(['empresas.access']);
    assert.equal(await result.router.canActivate(route, ctx), false);
  });

  it('bloqueia rota sem regra de permissão aplicável (ausência = default-deny)', async () => {
    const crb = buildEmpresasCrbFixture({ permissionEntries: [] });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);
    const context = createContext({ tenantId: 'tenant-a' });

    const result = await loadRuntimeBundle({ context, pin, loader });
    const route = result.router.match('/empresas', pin.applicationId, crb.moduleId);

    const ctx = buildCtx([]);
    assert.equal(await result.router.canActivate(route, ctx), false);
  });
});

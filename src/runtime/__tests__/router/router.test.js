import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createRuntimeRouter } from '../../core/router/runtimeRouter.js';
import { RouteError } from '../../core/router/errors.js';
import { RouteMatcher } from '../../core/router/RouteMatcher.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

describe('M08 — Runtime Router', () => {
  it('registers routes from CRB', () => {
    const router = createRuntimeRouter();
    const crb = buildEmpresasCrbFixture();
    const table = router.registerFromCrb(crb, 'app-erp');

    assert.equal(table.routeCount, 1);
    assert.equal(table.routes[0].path, '/empresas');
    assert.equal(router.state, 'ready');
  });

  it('throws on route conflict', () => {
    const router = createRuntimeRouter();
    router.registerRoute({
      path: '/empresas',
      objectId: 'r1',
      applicationId: 'app-erp',
      moduleId: 'empresas',
    });

    assert.throws(
      () =>
        router.registerRoute({
          path: '/empresas',
          objectId: 'r2',
          applicationId: 'app-erp',
          moduleId: 'empresas',
        }),
      (err) => err instanceof RouteError && err.code === 'MAK-L3-ROUTE-001',
    );
  });

  it('matches URL with parameters', () => {
    const router = createRuntimeRouter();
    router.registerRoute({
      path: '/empresas/:id',
      objectId: 'screen-detail',
      screenId: 'screen-detail',
      applicationId: 'app-erp',
      moduleId: 'empresas',
    });

    const match = router.match('/empresas/42', 'app-erp', 'empresas');
    assert.equal(match?.screenId, 'screen-detail');
    assert.equal(match?.params.id, '42');
  });

  it('filters routes by module', () => {
    const router = createRuntimeRouter();
    router.registerRoute({
      path: '/empresas',
      objectId: 'e1',
      applicationId: 'app-erp',
      moduleId: 'empresas',
    });
    router.registerRoute({
      path: '/clientes',
      objectId: 'c1',
      applicationId: 'app-erp',
      moduleId: 'clientes',
    });

    assert.ok(router.match('/empresas', 'app-erp', 'empresas'));
    assert.equal(router.match('/clientes', 'app-erp', 'empresas'), null);
  });

  it('filters routes by application', () => {
    const router = createRuntimeRouter();
    router.registerRoute({
      path: '/app-a',
      objectId: 'a1',
      applicationId: 'app-a',
      moduleId: 'mod',
    });

    assert.ok(router.match('/app-a', 'app-a'));
    assert.equal(router.match('/app-a', 'app-b'), null);
  });

  it('navigates and preserves deep link match', async () => {
    const router = createRuntimeRouter();
    const crb = buildEmpresasCrbFixture();
    router.registerFromCrb(crb, 'app-erp');

    const match = await router.navigate({ path: '/empresas' }, 'app-erp', 'empresas');
    assert.equal(match.screenId, 'route-1');
    assert.equal(router.currentMatch?.path, '/empresas');
  });

  it('canActivate() is fail-closed without a wired Permission Engine (M09, C.5)', async () => {
    const router = createRuntimeRouter();
    const allowed = await router.canActivate({ path: '/x', objectId: 'x' }, {});
    assert.equal(allowed, false);
  });

  it('canActivate() delegates to the wired Permission Engine', async () => {
    const router = createRuntimeRouter();
    router.setPermissionEngine({ can: async () => true });
    const allowed = await router.canActivate({ path: '/x', objectId: 'x', moduleId: 'empresas' }, {});
    assert.equal(allowed, true);
  });

  it('RouteMatcher compiles parameterized patterns', () => {
    const compiled = RouteMatcher.compile('/empresas/:id/edit');
    const params = RouteMatcher.match(compiled, '/empresas/99/edit');
    assert.equal(params?.id, '99');
  });

  it('builds navigation table from CRB pin', () => {
    const crb = buildEmpresasCrbFixture();
    const pin = buildEnvironmentPinFromCrb(crb);
    const router = createRuntimeRouter();
    const table = router.registerFromCrb(crb, pin.applicationId);

    assert.equal(table.applicationId, 'app-erp');
    assert.equal(table.routeCount, 1);
  });
});

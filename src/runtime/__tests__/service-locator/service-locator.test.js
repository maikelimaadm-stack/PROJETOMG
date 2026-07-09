import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import {
  createServiceLocator,
  createEmptyServiceLocator,
  ServiceLocatorError,
} from '../../infra/service-locator/serviceLocator.js';
import { bootstrap, hydrateWithBundle } from '../../core/bootstrap/bootstrap.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

const validConfig = {
  host: 'web',
  tenantId: 'tenant-a',
  applicationId: 'app-erp',
  environment: 'dev',
  apiBaseUrl: '/api',
};

describe('M20 — Service Locator', () => {
  it('singleton returns the same instance on every resolve', () => {
    const locator = createServiceLocator();
    let calls = 0;
    locator.register('svc', () => ({ id: ++calls }));

    const a = locator.resolve('svc');
    const b = locator.resolve('svc');

    assert.equal(calls, 1);
    assert.strictEqual(a, b);
  });

  it('scoped returns the same instance within the same scope', () => {
    const locator = createServiceLocator();
    locator.register('scopedSvc', () => ({ token: Symbol('x') }), { scope: 'scoped' });
    const scope = locator.createScope();

    const a = scope.resolve('scopedSvc');
    const b = scope.resolve('scopedSvc');

    assert.strictEqual(a, b);
  });

  it('scoped returns different instances in different scopes', () => {
    const locator = createServiceLocator();
    locator.register('scopedSvc', () => ({ token: Symbol('x') }), { scope: 'scoped' });

    const scopeA = locator.createScope();
    const scopeB = locator.createScope();

    const a = scopeA.resolve('scopedSvc');
    const b = scopeB.resolve('scopedSvc');

    assert.notStrictEqual(a, b);
  });

  it('child scope resolves registrations from the parent', () => {
    const parent = createServiceLocator();
    parent.register('parentSvc', () => 'from-parent');
    const child = parent.createScope();

    assert.equal(child.resolve('parentSvc'), 'from-parent');
    assert.equal(child.has('parentSvc'), true);
  });

  it('singleton resolved via a child scope shares the same instance as the parent', () => {
    const parent = createServiceLocator();
    parent.register('shared', () => ({ id: 1 }));
    const child = parent.createScope();

    assert.strictEqual(parent.resolve('shared'), child.resolve('shared'));
  });

  it('child scope does not pollute parent scoped instances', () => {
    const parent = createServiceLocator();
    parent.register('scopedSvc', () => ({ id: Math.random() }), { scope: 'scoped' });

    const parentInstance = parent.resolve('scopedSvc');
    const child = parent.createScope();
    const childInstance = child.resolve('scopedSvc');

    assert.notStrictEqual(parentInstance, childInstance);
    assert.strictEqual(parent.resolve('scopedSvc'), parentInstance);
  });

  it('resolving a missing token throws ServiceLocatorError MAK-L3-LOCATOR-002', () => {
    const locator = createServiceLocator();
    assert.throws(
      () => locator.resolve('missing'),
      (err) => err instanceof ServiceLocatorError && err.code === 'MAK-L3-LOCATOR-002',
    );
  });

  it('has() returns false for an unregistered token', () => {
    const locator = createServiceLocator();
    assert.equal(locator.has('missing'), false);
  });

  it('registering a duplicate token throws ServiceLocatorError MAK-L3-LOCATOR-001', () => {
    const locator = createServiceLocator();
    locator.register('dup', () => 1);
    assert.throws(
      () => locator.register('dup', () => 2),
      (err) => err instanceof ServiceLocatorError && err.code === 'MAK-L3-LOCATOR-001',
    );
  });

  it('registering with an invalid scope throws ServiceLocatorError MAK-L3-LOCATOR-003', () => {
    const locator = createServiceLocator();
    assert.throws(
      () => locator.register('bad', () => 1, { scope: 'transient' }),
      (err) => err instanceof ServiceLocatorError && err.code === 'MAK-L3-LOCATOR-003',
    );
  });

  it('duplicate registration with override:true replaces the previous factory', () => {
    const locator = createServiceLocator();
    locator.register('token', () => 'v1');
    assert.equal(locator.resolve('token'), 'v1');

    locator.register('token', () => 'v2', { override: true });
    assert.equal(locator.resolve('token'), 'v2');
  });

  it('clear() removes registrations and singleton cache without breaking the API', () => {
    const locator = createServiceLocator();
    locator.register('svc', () => 'value');
    locator.resolve('svc');

    locator.clear();

    assert.equal(locator.has('svc'), false);
    assert.throws(() => locator.resolve('svc'), ServiceLocatorError);

    locator.register('svc', () => 'value-again');
    assert.equal(locator.resolve('svc'), 'value-again');
  });

  it('createEmptyServiceLocator() is backward compatible and returns the real implementation', () => {
    const locator = createEmptyServiceLocator();
    locator.register('svc', () => 'ok');
    assert.equal(locator.resolve('svc'), 'ok');
    assert.ok(locator instanceof createServiceLocator().constructor);
  });

  it('core M01–M08 services are resolvable via the locator post RT-3 (bootstrap + hydrate)', async () => {
    const instance = await bootstrap(validConfig);

    assert.equal(instance._serviceLocator.has('context'), true);
    assert.equal(instance._serviceLocator.has('registry'), true);
    assert.strictEqual(instance._serviceLocator.resolve('context'), instance.context);

    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const result = await hydrateWithBundle(instance, pin, crb);

    assert.strictEqual(instance._serviceLocator.resolve('registry'), result.registry);
    assert.ok(instance._serviceLocator.has('loader'));
    assert.ok(instance._serviceLocator.has('crbLoader'));
    assert.ok(instance._serviceLocator.has('dependencyResolver'));
    assert.ok(instance._serviceLocator.has('router'));

    const router = instance._serviceLocator.resolve('router');
    assert.equal(router.routeCount, 1);
  });
});

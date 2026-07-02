import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bootstrap, hydrateWithBundle } from '../../core/bootstrap/bootstrap.js';
import { createContext } from '../../core/context/createContext.js';
import { createSessionManager } from '../../core/session/SessionFactory.js';
import { loadRuntimeBundle } from '../../core/bootstrap/loadRuntimeBundle.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

const validConfig = {
  host: 'web',
  tenantId: 'tenant-a',
  applicationId: 'app-erp',
  environment: 'dev',
  apiBaseUrl: '/api',
};

describe('Foundation C.3 — Runtime Bundle pipeline', () => {
  it('Bootstrap → Context → Session → Registry → CRB → Loader → RuntimeBundle', async () => {
    const instance = await bootstrap(validConfig);
    assert.equal(instance.phase, 'RT-0');
    assert.ok(instance.registry);

    const ctx = createContext({ tenantId: 'tenant-a', traceId: instance.context.traceId });
    const session = createSessionManager(ctx);
    const scope = await session.authenticate({
      username: 'kaiman',
      password: 'kaiman',
      tenantId: 'tenant-a',
    });
    assert.equal(scope.tenantId, 'tenant-a');

    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);

    const result = await loadRuntimeBundle({
      context: session.getContext(),
      pin,
      loader,
      registry: instance.registry,
    });

    assert.equal(result.bundle.status, 'ready');
    assert.equal(result.registry.isFrozen, true);
    assert.ok(result.registry.countEntries() > 0);
    assert.ok(result.bundle.metrics.bootstrapMs >= 0);
    assert.ok(result.bundle.metrics.validationsExecuted > 0);
    assert.ok(result.bundle.metrics.registryObjectCount > 0);
  });

  it('hydrateWithBundle transitions instance to RT-3', async () => {
    const instance = await bootstrap(validConfig);
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);

    const hydrated = await hydrateWithBundle(instance, pin, crb);
    assert.equal(hydrated.instance.phase, 'RT-3');
    assert.equal(hydrated.instance.status, 'hydrated');
    assert.equal(hydrated.bundle.crb.moduleId, 'empresas');
    assert.ok(hydrated.registry.has('renderer', 'view-1'));
  });
});

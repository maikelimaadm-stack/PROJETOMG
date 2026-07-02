import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bootstrap, destroy, hydrate, hydrateWithBundle, RuntimeBootstrapError } from '../../core/bootstrap/bootstrap.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

const validConfig = {
  host: 'web',
  tenantId: 'tenant-a',
  applicationId: 'app-erp',
  environment: 'dev',
  apiBaseUrl: '/api',
};

describe('M01 — Bootstrap RT-0 shell + C.3 hydrate', () => {
  it('bootstrap() returns RT-0 shell-ready instance with registry', async () => {
    const instance = await bootstrap(validConfig);
    assert.equal(instance.phase, 'RT-0');
    assert.equal(instance.status, 'shell-ready');
    assert.ok(instance.context);
    assert.ok(instance.context.traceId);
    assert.ok(instance.registry);
    assert.equal(instance.config.applicationId, 'app-erp');
  });

  it('bootstrap() rejects incomplete config with MAK-L3-RUNTIME-001', async () => {
    await assert.rejects(
      () => bootstrap(/** @type {import('../../types/context.js').BootstrapConfig} */ ({})),
      (err) => err instanceof RuntimeBootstrapError && err.code === 'MAK-L3-RUNTIME-001',
    );
  });

  it('destroy() cleans instance', async () => {
    const instance = await bootstrap(validConfig);
    await destroy(instance);
    assert.equal(instance.status, 'destroyed');
  });

  it('hydrate() requires CRB payload (C.3)', async () => {
    const instance = await bootstrap(validConfig);
    await assert.rejects(
      () => hydrate(instance, { bundleId: 'b1', definitionVersionId: 'dv1' }),
      (err) => err instanceof RuntimeBootstrapError && err.code === 'MAK-L3-RUNTIME-002',
    );
  });

  it('hydrateWithBundle() completes RT-3 hydrate', async () => {
    const instance = await bootstrap(validConfig);
    const crb = buildEmpresasCrbFixture({ tenantId: 'tenant-a' });
    const pin = buildEnvironmentPinFromCrb(crb);

    const result = await hydrateWithBundle(instance, pin, crb);
    assert.equal(result.instance.phase, 'RT-3');
    assert.equal(result.instance.status, 'hydrated');
    assert.ok(result.registry.isFrozen);
  });
});

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { bootstrap, destroy, hydrate, RuntimeBootstrapError } from '../../core/bootstrap/bootstrap.js';

const validConfig = {
  host: 'web',
  tenantId: '',
  applicationId: 'app-erp',
  environment: 'dev',
  apiBaseUrl: '/api',
};

describe('M01 — Bootstrap RT-0 shell (C.1 partial)', () => {
  it('bootstrap() returns RT-0 shell-ready instance', async () => {
    const instance = await bootstrap(validConfig);
    assert.equal(instance.phase, 'RT-0');
    assert.equal(instance.status, 'shell-ready');
    assert.ok(instance.context);
    assert.ok(instance.context.traceId);
    assert.equal(instance.accessScope.tenantId, '');
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

  it('hydrate() is not available in C.1 scope', async () => {
    const instance = await bootstrap(validConfig);
    await assert.rejects(
      () => hydrate(instance, { bundleId: 'bundle-1' }),
      (err) => err instanceof RuntimeBootstrapError && err.code === 'MAK-L3-RUNTIME-003',
    );
  });
});

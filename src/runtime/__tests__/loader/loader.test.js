import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { createContext } from '../../core/context/createContext.js';
import { createLoader } from '../../core/loader/loaderManager.js';
import { LoaderContext } from '../../core/loader/LoaderContext.js';
import { LoaderError } from '../../core/loader/errors.js';
import { buildEmpresasCrbFixture, buildEnvironmentPinFromCrb } from '../fixtures/empresas-crb.fixture.js';

describe('M05 — Universal Loader', () => {
  it('loads valid bundle through pipeline', async () => {
    const crb = buildEmpresasCrbFixture();
    const pin = buildEnvironmentPinFromCrb(crb);
    const ctx = createContext({ tenantId: crb.tenantId });
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);

    const payload = await loader.load({ bundleId: crb.bundleId }, new LoaderContext({ runtimeContext: ctx, pin }));
    assert.equal(payload.crbVersion, 'mmm-crb-v1');
    assert.ok(loader.validationsExecuted >= 3);
  });

  it('rejects invalid bundle structure', async () => {
    const loader = createLoader();
    loader.registerBundle('bad-bundle', { foo: 'bar' });
    const ctx = createContext({ tenantId: 'tenant-a' });

    await assert.rejects(
      () => loader.load({ bundleId: 'bad-bundle' }, new LoaderContext({ runtimeContext: ctx })),
      (err) => err instanceof LoaderError && err.code === 'MAK-L3-LOADER-001',
    );
  });

  it('rejects invalid environment pin tenant', async () => {
    const crb = buildEmpresasCrbFixture();
    const pin = buildEnvironmentPinFromCrb(crb);
    const ctx = createContext({ tenantId: 'other-tenant' });
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);

    await assert.rejects(
      () => loader.load({ bundleId: crb.bundleId }, new LoaderContext({ runtimeContext: ctx, pin })),
      (err) => err instanceof LoaderError && err.code === 'MAK-L3-LOADER-004',
    );
  });

  it('rejects pin/bundleId mismatch', async () => {
    const crb = buildEmpresasCrbFixture();
    const pin = { ...buildEnvironmentPinFromCrb(crb), bundleId: 'wrong-id' };
    const ctx = createContext({ tenantId: crb.tenantId });
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);

    await assert.rejects(
      () => loader.load({ bundleId: crb.bundleId }, new LoaderContext({ runtimeContext: ctx, pin })),
      (err) => err instanceof LoaderError && err.code === 'MAK-L3-LOADER-003',
    );
  });

  it('supports cache hit/miss and invalidation', async () => {
    const crb = buildEmpresasCrbFixture();
    const pin = buildEnvironmentPinFromCrb(crb);
    const ctx = createContext({ tenantId: crb.tenantId });
    const loaderCtx = new LoaderContext({ runtimeContext: ctx, pin });
    const loader = createLoader();
    loader.registerBundle(crb.bundleId, crb);

    await loader.load({ bundleId: crb.bundleId }, loaderCtx);
    const cached = await loader.loadCached({ bundleId: crb.bundleId }, loaderCtx);
    assert.equal(cached.bundleId, crb.bundleId);

    loader.invalidate({ bundleId: crb.bundleId });
    assert.equal(loader.state, 'invalidated');
  });
});

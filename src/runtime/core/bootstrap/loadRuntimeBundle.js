import { createRegistry } from '../registry/registryManager.js';
import { createLoader } from '../loader/loaderManager.js';
import { LoaderContext } from '../loader/LoaderContext.js';
import { createCrbLoader } from '../crb/crbLoader.js';
import { BundleResolver } from '../crb/BundleResolver.js';
import { BundleLifecycle } from '../crb/BundleLifecycle.js';
import { CrbError } from '../crb/errors.js';
import { captureRuntimeMetrics } from '../../infra/observability/runtimeMetrics.js';

/**
 * Full C.3 pipeline: Loader → CRB verify → Registry hydrate → RuntimeBundle.
 * @param {Object} params
 * @param {import('../context/RuntimeContext.js').RuntimeContext} params.context
 * @param {import('../../types/crb.js').EnvironmentPin} params.pin
 * @param {import('../loader/loaderManager.js').LoaderManager} [params.loader]
 * @param {import('../registry/registryManager.js').RegistryManager} [params.registry]
 * @param {import('../crb/crbLoader.js').CRBLoader} [params.crbLoader]
 */
export async function loadRuntimeBundle({
  context,
  pin,
  loader = createLoader(),
  registry = createRegistry(),
  crbLoader = createCrbLoader(pin.environment),
}) {
  const bootstrapStarted = performance.now();
  let crbLoadMs = 0;
  let hydrationMs = 0;
  let validationsExecuted = 0;

  const loaderCtx = new LoaderContext({
    runtimeContext: context,
    pin,
    environment: pin.environment,
  });

  const crbStarted = performance.now();
  const crb = await crbLoader.fetch(pin.bundleId, loader, loaderCtx);
  crbLoadMs = performance.now() - crbStarted;
  validationsExecuted += loader.validationsExecuted;

  const verification = crbLoader.verify(crb, pin);
  validationsExecuted += verification.validationsExecuted;

  if (!verification.valid) {
    throw new CrbError('MAK-L3-RUNTIME-002', verification.errors.join('; '));
  }

  const hydration = crbLoader.hydrate(crb, registry);
  hydrationMs = hydration.hydrationMs;
  registry.freeze();

  const metrics = captureRuntimeMetrics({
    bootstrapMs: performance.now() - bootstrapStarted,
    crbLoadMs,
    hydrationMs,
    registryObjectCount: registry.countEntries(),
    validationsExecuted,
  });

  /** @type {import('../../types/crb.js').RuntimeBundle} */
  const bundle = {
    crb,
    pin,
    status: 'ready',
    metrics,
  };

  return {
    bundle,
    registry,
    loader,
    crbLoader,
    lifecycle: BundleLifecycle.READY,
  };
}

export { BundleResolver };

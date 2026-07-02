import { createRegistry } from '../registry/registryManager.js';
import { createLoader } from '../loader/loaderManager.js';
import { LoaderContext } from '../loader/LoaderContext.js';
import { createCrbLoader } from '../crb/crbLoader.js';
import { BundleLifecycle } from '../crb/BundleLifecycle.js';
import { CrbError } from '../crb/errors.js';
import { createDependencyResolver } from '../dependency/dependencyResolver.js';
import { createRuntimeRouter } from '../router/runtimeRouter.js';
import { captureRuntimeMetrics } from '../../infra/observability/runtimeMetrics.js';

/**
 * Full C.4 pipeline: Loader → CRB → Registry → Dependency → Router → Runtime Ready.
 */
export async function loadRuntimeBundle({
  context,
  pin,
  loader = createLoader(),
  registry = createRegistry(),
  crbLoader = createCrbLoader(pin.environment),
  dependencyResolver = createDependencyResolver(),
  router = createRuntimeRouter(),
}) {
  const bootstrapStarted = performance.now();
  let crbLoadMs = 0;
  let hydrationMs = 0;
  let dependencyResolveMs = 0;
  let dagBuildMs = 0;
  let routeRegisterMs = 0;
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

  const depStarted = performance.now();
  const graph = dependencyResolver.resolveFromCrb(crb, crb.moduleId ? [crb.moduleId] : []);
  dependencyResolveMs = performance.now() - depStarted;
  dagBuildMs = dependencyResolver.lastDagBuildMs;

  const navTable = router.registerFromCrb(crb, pin.applicationId);
  routeRegisterMs = router.lastRegisterMs;

  const metrics = captureRuntimeMetrics({
    bootstrapMs: performance.now() - bootstrapStarted,
    crbLoadMs,
    hydrationMs,
    dependencyResolveMs,
    dagBuildMs,
    routeRegisterMs,
    registryObjectCount: registry.countEntries(),
    routeCount: navTable.routeCount,
    dependencyCount: graph.dependencyCount,
    graphMaxDepth: graph.maxDepth,
    validationsExecuted,
  });

  /** @type {import('../../types/crb.js').RuntimeBundle} */
  const bundle = {
    crb,
    pin,
    status: 'runtime-ready',
    dependencyGraph: {
      nodes: graph.nodes,
      initOrder: graph.initOrder,
      dependencyCount: graph.dependencyCount,
      maxDepth: graph.maxDepth,
      valid: true,
    },
    navigationTable: navTable,
    metrics,
  };

  return {
    bundle,
    registry,
    loader,
    crbLoader,
    dependencyResolver,
    dependencyGraph: graph,
    router,
    navigationTable: navTable,
    lifecycle: BundleLifecycle.READY,
  };
}

export { BundleResolver } from '../crb/BundleResolver.js';

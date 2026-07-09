import { createRegistry } from '../registry/registryManager.js';
import { createLoader } from '../loader/loaderManager.js';
import { LoaderContext } from '../loader/LoaderContext.js';
import { createCrbLoader } from '../crb/crbLoader.js';
import { BundleLifecycle } from '../crb/BundleLifecycle.js';
import { CrbError } from '../crb/errors.js';
import { createDependencyResolver } from '../dependency/dependencyResolver.js';
import { createRuntimeRouter } from '../router/runtimeRouter.js';
import { createPermissionEngine } from '../permission/permissionEngine.js';
import { createActionEngine } from '../action/actionEngine.js';
import { createWorkflowEngine } from '../workflow/workflowEngine.js';
import { createRenderEngine } from '../render/renderEngine.js';
import { createExpressionEngine } from '../expression/expressionEngine.js';
import { createFormulaEngine } from '../formula/formulaEngine.js';
import { createValidationEngine } from '../validation/validationEngine.js';
import { createExecutionEngine } from '../execution/executionEngine.js';
import { createStateEngine } from '../state/stateEngine.js';
import { createPluginEngine } from '../plugin/pluginEngine.js';
import { createConnectorEngine } from '../connector/connectorEngine.js';
import { createCacheEngine } from '../../infra/cache/cacheEngine.js';
import { createEventBus } from '../../infra/event-bus/eventBus.js';
import { createTransactionEngine } from '../../infra/transaction/transactionEngine.js';
import { captureRuntimeMetrics } from '../../infra/observability/runtimeMetrics.js';

/**
 * Full C.16 pipeline: Loader → CRB → Registry → Dependency → Permission → Action → Workflow → Render → Expression → Formula → Validation → Execution → State → Plugin → Connector → Cache → EventBus → Transaction → Router → Runtime Ready.
 */
export async function loadRuntimeBundle({
  context,
  pin,
  loader = createLoader(),
  registry = createRegistry(),
  crbLoader = createCrbLoader(pin.environment),
  dependencyResolver = createDependencyResolver(),
  router = createRuntimeRouter(),
  permissionEngine,
  actionEngine,
  workflowEngine,
  renderEngine,
  expressionEngine,
  formulaEngine,
  validationEngine,
  executionEngine,
  stateEngine,
  pluginEngine,
  connectorEngine,
  cacheEngine,
  eventBus,
  transactionEngine,
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

  // M09 — permission matrix is built from the frozen, hydrated registry (RT-3 → RT-5 handoff).
  const resolvedPermissionEngine = permissionEngine ?? createPermissionEngine({ registry });
  router.setPermissionEngine(resolvedPermissionEngine);

  // M10 — action dispatch resolves CRB `action` registry entries; permission checks delegate to M09.
  const resolvedActionEngine =
    actionEngine ?? createActionEngine({ registry, permissionEngine: resolvedPermissionEngine });

  // M11 — workflow instances resolve CRB `workflow` registry entries; action steps delegate to M10.
  const resolvedWorkflowEngine =
    workflowEngine ??
    createWorkflowEngine({
      registry,
      actionEngine: resolvedActionEngine,
      permissionEngine: resolvedPermissionEngine,
    });

  // M12 — render tree building resolves CRB `layout`/`field` registries; visibility delegates to M09.
  const resolvedRenderEngine =
    renderEngine ?? createRenderEngine({ registry, permissionEngine: resolvedPermissionEngine });

  // M13/M14 — safe, sandboxed expression/formula evaluation over the hydrated registry. No eval/new Function.
  const resolvedExpressionEngine = expressionEngine ?? createExpressionEngine();
  const resolvedFormulaEngine =
    formulaEngine ?? createFormulaEngine({ registry, expressionEngine: resolvedExpressionEngine });

  // M15 — declarative validation delegates custom-rule evaluation to M13, never reimplemented.
  const resolvedValidationEngine =
    validationEngine ?? createValidationEngine({ registry, expressionEngine: resolvedExpressionEngine });

  // M16 — UP-09 pipeline orchestrator: Validate (M15) → Authorize (M09) → Execute (M10/M11). No logic duplicated.
  const resolvedExecutionEngine =
    executionEngine ??
    createExecutionEngine({
      registry,
      actionEngine: resolvedActionEngine,
      workflowEngine: resolvedWorkflowEngine,
      validationEngine: resolvedValidationEngine,
      permissionEngine: resolvedPermissionEngine,
    });

  // M17 — isolated local runtime state store. Route-scoped/entity-scoped via `scope()`; no persistence, no DB.
  const resolvedStateEngine = stateEngine ?? createStateEngine();

  // M18 — registry-driven plugin resolution; manifests are declarative data, capability behavior is host-registered (no eval/dynamic import).
  const resolvedPluginEngine =
    pluginEngine ?? createPluginEngine({ registry, permissionEngine: resolvedPermissionEngine });

  // M19 — registry-driven connector resolution; actual transport (HTTP/DB/etc.) is always a host-registered adapter, never a direct call in core runtime.
  const resolvedConnectorEngine =
    connectorEngine ?? createConnectorEngine({ registry, permissionEngine: resolvedPermissionEngine });

  // M21/M22 — runtime-local infra: deterministic cache and in-process event bus stub (D-RI-08). No broker, no persistence.
  const resolvedCacheEngine = cacheEngine ?? createCacheEngine();
  const resolvedEventBus = eventBus ?? createEventBus();

  // M23 — runtime-local unit-of-work coordinator over host-registered participants. Never opens a real DB/Prisma transaction.
  const resolvedTransactionEngine = transactionEngine ?? createTransactionEngine();

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
    permissionEngine: resolvedPermissionEngine,
    actionEngine: resolvedActionEngine,
    workflowEngine: resolvedWorkflowEngine,
    renderEngine: resolvedRenderEngine,
    expressionEngine: resolvedExpressionEngine,
    formulaEngine: resolvedFormulaEngine,
    validationEngine: resolvedValidationEngine,
    executionEngine: resolvedExecutionEngine,
    stateEngine: resolvedStateEngine,
    pluginEngine: resolvedPluginEngine,
    connectorEngine: resolvedConnectorEngine,
    cacheEngine: resolvedCacheEngine,
    eventBus: resolvedEventBus,
    transactionEngine: resolvedTransactionEngine,
    lifecycle: BundleLifecycle.READY,
  };
}

export { BundleResolver } from '../crb/BundleResolver.js';

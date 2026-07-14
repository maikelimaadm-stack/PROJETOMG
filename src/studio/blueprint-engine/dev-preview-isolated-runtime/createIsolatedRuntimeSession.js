import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_RUNTIME_VERSION, ISOLATED_RUNTIME_MODE, runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Builds a pure, deterministic isolated-runtime SESSION descriptor from an Isolated Runtime
 * Implementation Plan. Pure metadata — no storage, no fetch, no persistence, no external side
 * effect. `seed` derives from the source digests so it is stable across runs.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan] an isolated runtime implementation plan
 * @returns {Object} runtime session descriptor
 */
export function createIsolatedRuntimeSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};
  const moduleId = String(plan.moduleId ?? 'plannedModule').trim();
  const sourcePlanDigest = typeof plan.overallDigest === 'string' ? plan.overallDigest : null;
  const sourceRuntimeShellDigest = typeof plan.session?.sourceRuntimeShellDigest === 'string' ? plan.session.sourceRuntimeShellDigest : null;
  const seed = runtimeDigest({ moduleId, sourcePlanDigest, sourceRuntimeShellDigest });

  const core = {
    kind: 'isolated-runtime-session',
    sessionId: `${moduleId}#dev-preview-isolated-runtime`,
    isolatedRuntimeVersion: ISOLATED_RUNTIME_VERSION,
    moduleId,
    sourceImplementationPlan: typeof plan.implementationPlanVersion === 'string' ? plan.implementationPlanVersion : 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0',
    sourceRuntimeShellContract: typeof plan.runtimeShellContractVersion === 'string' ? plan.runtimeShellContractVersion : 'studio-dev-preview-runtime-shell-contract@1.0.0',
    sourceVisualContract: typeof plan.visualContractVersion === 'string' ? plan.visualContractVersion : 'studio-dev-preview-visual-contract@1.0.0',
    sourceBridgeContract: typeof plan.bridgeVersion === 'string' ? plan.bridgeVersion : 'studio-dev-preview-contract-bridge@1.0.0',
    sourceSandboxContract: typeof plan.sandboxVersion === 'string' ? plan.sandboxVersion : 'studio-module-preview-sandbox-contract@1.0.0',
    sourcePlannerContract: typeof plan.plannerVersion === 'string' ? plan.plannerVersion : 'studio-blueprint-module-reference-planner@1.0.0',
    sourceEngineContract: typeof plan.engineVersion === 'string' ? plan.engineVersion : 'studio-blueprint-engine@1.0.0',
    sourcePlanDigest,
    sourceRuntimeShellDigest,
    mode: ISOLATED_RUNTIME_MODE,
    createdFrom: 'studio-dev-preview-isolated-runtime-implementation-plan',
    seed,
    devOnly: true,
    isolated: true,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    externalSideEffects: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, sessionDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeSession;

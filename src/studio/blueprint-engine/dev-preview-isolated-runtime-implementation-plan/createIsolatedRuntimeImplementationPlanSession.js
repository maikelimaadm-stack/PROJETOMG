import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { IMPLEMENTATION_PLAN_VERSION, IMPLEMENTATION_PLAN_MODE, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Builds a pure, deterministic plan SESSION descriptor from a Dev Preview Runtime Shell
 * Contract. Pure metadata — no storage, no fetch, no persistence, no runtime side effect.
 * `seed` derives from the source digests so it is stable across runs.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeShellContract] a dev preview runtime shell contract
 * @returns {Object} plan session descriptor
 */
export function createIsolatedRuntimeImplementationPlanSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const rs = isGenericModelPlainObject(o.runtimeShellContract) ? o.runtimeShellContract : {};
  const moduleId = String(rs.moduleId ?? 'plannedModule').trim();
  const sourceRuntimeShellDigest = typeof rs.overallDigest === 'string' ? rs.overallDigest : null;
  const sourceVisualDigest = typeof rs.session?.sourceVisualDigest === 'string' ? rs.session.sourceVisualDigest : null;
  const seed = planDigest({ moduleId, sourceRuntimeShellDigest, sourceVisualDigest });

  const core = {
    kind: 'isolated-runtime-implementation-plan-session',
    sessionId: `${moduleId}#dev-preview-isolated-runtime-implementation-plan`,
    implementationPlanVersion: IMPLEMENTATION_PLAN_VERSION,
    moduleId,
    sourceRuntimeShellContract: typeof rs.runtimeShellContractVersion === 'string' ? rs.runtimeShellContractVersion : 'studio-dev-preview-runtime-shell-contract@1.0.0',
    sourceVisualContract: typeof rs.visualContractVersion === 'string' ? rs.visualContractVersion : 'studio-dev-preview-visual-contract@1.0.0',
    sourceBridgeContract: typeof rs.bridgeVersion === 'string' ? rs.bridgeVersion : 'studio-dev-preview-contract-bridge@1.0.0',
    sourceSandboxContract: typeof rs.sandboxVersion === 'string' ? rs.sandboxVersion : 'studio-module-preview-sandbox-contract@1.0.0',
    sourcePlannerContract: typeof rs.plannerVersion === 'string' ? rs.plannerVersion : 'studio-blueprint-module-reference-planner@1.0.0',
    sourceEngineContract: typeof rs.engineVersion === 'string' ? rs.engineVersion : 'studio-blueprint-engine@1.0.0',
    sourceRuntimeShellDigest,
    sourceVisualDigest,
    mode: IMPLEMENTATION_PLAN_MODE,
    createdFrom: 'studio-dev-preview-runtime-shell-contract',
    seed,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, sessionDigest: planDigest(core) });
}

export default createIsolatedRuntimeImplementationPlanSession;

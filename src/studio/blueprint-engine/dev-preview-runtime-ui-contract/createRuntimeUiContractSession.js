import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_CONTRACT_VERSION, RUNTIME_UI_CONTRACT_MODE, uiContractDigest } from './runtimeUiContractConfig.js';

/**
 * Builds a pure, deterministic runtime-UI-contract SESSION descriptor from a Dev Preview
 * Isolated Runtime. Pure metadata — no storage, no fetch, no persistence, no side effect.
 * `seed` derives from the source digests so it is stable across runs.
 *
 * @param {Object} [options]
 * @param {Object} [options.isolatedRuntime] a dev preview isolated runtime
 * @returns {Object} session descriptor
 */
export function createRuntimeUiContractSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ir = isGenericModelPlainObject(o.isolatedRuntime) ? o.isolatedRuntime : {};
  const moduleId = String(ir.moduleId ?? 'plannedModule').trim();
  const sourceIsolatedRuntimeDigest = typeof ir.overallDigest === 'string' ? ir.overallDigest : null;
  const sourceVirtualFrameDigest = typeof ir.virtualFrame?.virtualFrameDigest === 'string' ? ir.virtualFrame.virtualFrameDigest : null;
  const seed = uiContractDigest({ moduleId, sourceIsolatedRuntimeDigest, sourceVirtualFrameDigest });

  const core = {
    kind: 'runtime-ui-contract-session',
    sessionId: `${moduleId}#dev-preview-runtime-ui-contract`,
    runtimeUiContractVersion: RUNTIME_UI_CONTRACT_VERSION,
    moduleId,
    sourceIsolatedRuntime: typeof ir.isolatedRuntimeVersion === 'string' ? ir.isolatedRuntimeVersion : 'studio-dev-preview-isolated-runtime@1.0.0',
    sourceImplementationPlan: typeof ir.implementationPlanVersion === 'string' ? ir.implementationPlanVersion : 'studio-dev-preview-isolated-runtime-implementation-plan@1.0.0',
    sourceRuntimeShellContract: typeof ir.runtimeShellContractVersion === 'string' ? ir.runtimeShellContractVersion : 'studio-dev-preview-runtime-shell-contract@1.0.0',
    sourceVisualContract: typeof ir.visualContractVersion === 'string' ? ir.visualContractVersion : 'studio-dev-preview-visual-contract@1.0.0',
    sourceBridgeContract: typeof ir.bridgeVersion === 'string' ? ir.bridgeVersion : 'studio-dev-preview-contract-bridge@1.0.0',
    sourceSandboxContract: typeof ir.sandboxVersion === 'string' ? ir.sandboxVersion : 'studio-module-preview-sandbox-contract@1.0.0',
    sourcePlannerContract: typeof ir.plannerVersion === 'string' ? ir.plannerVersion : 'studio-blueprint-module-reference-planner@1.0.0',
    sourceEngineContract: typeof ir.engineVersion === 'string' ? ir.engineVersion : 'studio-blueprint-engine@1.0.0',
    sourceIsolatedRuntimeDigest,
    sourceVirtualFrameDigest,
    mode: RUNTIME_UI_CONTRACT_MODE,
    createdFrom: 'studio-dev-preview-isolated-runtime',
    seed,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, sessionDigest: uiContractDigest(core) });
}

export default createRuntimeUiContractSession;

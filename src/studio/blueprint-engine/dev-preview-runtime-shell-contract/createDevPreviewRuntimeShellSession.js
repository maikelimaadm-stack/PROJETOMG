import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_SHELL_CONTRACT_VERSION, RUNTIME_SHELL_CONTRACT_MODE, shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Builds a pure, deterministic runtime-shell SESSION descriptor from a Dev Preview Visual
 * Contract. Pure metadata — no storage, no fetch, no persistence, no runtime side effect.
 * `seed` derives from the source digests so it is stable across runs.
 *
 * @param {Object} [options]
 * @param {Object} [options.visualContract] a dev preview visual contract
 * @returns {Object} runtime shell session descriptor
 */
export function createDevPreviewRuntimeShellSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const vc = isGenericModelPlainObject(o.visualContract) ? o.visualContract : {};
  const moduleId = String(vc.moduleId ?? 'plannedModule').trim();
  const sourceVisualDigest = typeof vc.overallDigest === 'string' ? vc.overallDigest : null;
  const sourceBridgeDigest = typeof vc.session?.sourceBridgeDigest === 'string' ? vc.session.sourceBridgeDigest : null;
  const seed = shellDigest({ moduleId, sourceVisualDigest, sourceBridgeDigest });

  const core = {
    kind: 'dev-preview-runtime-shell-session',
    sessionId: `${moduleId}#dev-preview-runtime-shell-contract`,
    runtimeShellContractVersion: RUNTIME_SHELL_CONTRACT_VERSION,
    moduleId,
    sourceVisualContract: typeof vc.visualContractVersion === 'string' ? vc.visualContractVersion : 'studio-dev-preview-visual-contract@1.0.0',
    sourceBridgeContract: typeof vc.bridgeVersion === 'string' ? vc.bridgeVersion : 'studio-dev-preview-contract-bridge@1.0.0',
    sourceSandboxContract: typeof vc.sandboxVersion === 'string' ? vc.sandboxVersion : 'studio-module-preview-sandbox-contract@1.0.0',
    sourcePlannerContract: typeof vc.plannerVersion === 'string' ? vc.plannerVersion : 'studio-blueprint-module-reference-planner@1.0.0',
    sourceEngineContract: typeof vc.engineVersion === 'string' ? vc.engineVersion : 'studio-blueprint-engine@1.0.0',
    sourceVisualDigest,
    sourceBridgeDigest,
    mode: RUNTIME_SHELL_CONTRACT_MODE,
    createdFrom: 'studio-dev-preview-visual-contract',
    seed,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, sessionDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellSession;

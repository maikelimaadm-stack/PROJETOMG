import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { VISUAL_CONTRACT_VERSION, VISUAL_CONTRACT_MODE, visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Builds a pure, deterministic visual-contract SESSION descriptor from a Dev Preview Contract
 * Bridge. Pure metadata — no storage, no fetch, no persistence, no runtime side effect.
 * `seed` derives from the source digests so it is stable across runs.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} visual contract session descriptor
 */
export function createDevPreviewVisualContractSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.bridge) ? o.bridge : {};
  const moduleId = String(b.moduleId ?? 'plannedModule').trim();
  const sourceBridgeDigest = typeof b.overallDigest === 'string' ? b.overallDigest : null;
  const sourceSandboxDigest = typeof b.session?.sourceSandboxDigest === 'string' ? b.session.sourceSandboxDigest : null;
  const seed = visualDigest({ moduleId, sourceBridgeDigest, sourceSandboxDigest });

  const core = {
    kind: 'dev-preview-visual-contract-session',
    sessionId: `${moduleId}#dev-preview-visual-contract`,
    visualContractVersion: VISUAL_CONTRACT_VERSION,
    moduleId,
    sourceBridgeContract: typeof b.bridgeVersion === 'string' ? b.bridgeVersion : 'studio-dev-preview-contract-bridge@1.0.0',
    sourceSandboxContract: typeof b.session?.sourceSandboxContract === 'string' ? b.session.sourceSandboxContract : 'studio-module-preview-sandbox-contract@1.0.0',
    sourcePlannerContract: typeof b.session?.sourcePlannerContract === 'string' ? b.session.sourcePlannerContract : 'studio-blueprint-module-reference-planner@1.0.0',
    sourceEngineContract: typeof b.session?.sourceEngineContract === 'string' ? b.session.sourceEngineContract : 'studio-blueprint-engine@1.0.0',
    sourceBridgeDigest,
    sourceSandboxDigest,
    mode: VISUAL_CONTRACT_MODE,
    createdFrom: 'studio-dev-preview-contract-bridge',
    seed,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, sessionDigest: visualDigest(core) });
}

export default createDevPreviewVisualContractSession;

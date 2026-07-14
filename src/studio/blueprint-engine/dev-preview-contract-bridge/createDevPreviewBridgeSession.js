import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { DEV_PREVIEW_BRIDGE_VERSION, DEV_PREVIEW_BRIDGE_MODE, bridgeDigest } from './devPreviewBridgeConfig.js';

/**
 * Builds a pure, deterministic dev-preview bridge SESSION descriptor from a Module Preview
 * Sandbox contract. Pure metadata — no storage, no fetch, no persistence, no runtime side
 * effect. `seed` derives from the source digests so it is stable across runs.
 *
 * @param {Object} [options]
 * @param {Object} [options.sandbox] a module preview sandbox contract
 * @returns {Object} bridge session descriptor
 */
export function createDevPreviewBridgeSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const s = isGenericModelPlainObject(o.sandbox) ? o.sandbox : {};
  const moduleId = String(s.moduleId ?? 'plannedModule').trim();
  const sourceSandboxDigest = typeof s.overallDigest === 'string' ? s.overallDigest : null;
  const sourceBlueprintDigest = typeof s.sourceBlueprintDigest === 'string' ? s.sourceBlueprintDigest : null;
  const seed = bridgeDigest({ moduleId, sourceSandboxDigest, sourceBlueprintDigest });

  const core = {
    kind: 'dev-preview-bridge-session',
    bridgeId: `${moduleId}#dev-preview-contract-bridge`,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    moduleId,
    sourceSandboxContract: typeof s.sandboxVersion === 'string' ? s.sandboxVersion : 'studio-module-preview-sandbox-contract@1.0.0',
    sourcePlannerContract: typeof s.plannerVersion === 'string' ? s.plannerVersion : 'studio-blueprint-module-reference-planner@1.0.0',
    sourceEngineContract: typeof s.engineVersion === 'string' ? s.engineVersion : 'studio-blueprint-engine@1.0.0',
    sourceSandboxDigest,
    sourceBlueprintDigest,
    mode: DEV_PREVIEW_BRIDGE_MODE,
    createdFrom: 'studio-module-preview-sandbox-contract',
    seed,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
    diagnostics: { passive: true },
  };

  return safeCloneGenericModel({ ...core, sessionDigest: bridgeDigest(core) });
}

export default createDevPreviewBridgeSession;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  DEV_PREVIEW_BRIDGE_NAME,
  DEV_PREVIEW_BRIDGE_VERSION,
  DEV_PREVIEW_BRIDGE_MODE,
  DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES,
  bridgeDigest,
} from './devPreviewBridgeConfig.js';

/**
 * Builds a deterministic, safe FALLBACK bridge contract used when the input sandbox is
 * invalid/absent. Pure, metadata-only. It is fully headless: empty schemas, blocked
 * readiness, all side-effect capabilities false. Guarantees the composer never throws.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object} fallback bridge contract
 */
export function createDevPreviewBridgeFallback(options = {}) {
  const reason = options && typeof options.reason === 'string' ? options.reason : 'invalid_or_missing_sandbox';

  const core = {
    kind: 'studio-dev-preview-contract-bridge',
    bridgeName: DEV_PREVIEW_BRIDGE_NAME,
    bridgeVersion: DEV_PREVIEW_BRIDGE_VERSION,
    mode: DEV_PREVIEW_BRIDGE_MODE,
    moduleId: 'plannedModule',
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForDevPreviewBridge: false,
    readyForDevPreviewVisualSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['dev_preview_bridge_fallback_invalid_sandbox'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...DEV_PREVIEW_BRIDGE_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, bridgeDigest: bridgeDigest(core) });
}

export default createDevPreviewBridgeFallback;

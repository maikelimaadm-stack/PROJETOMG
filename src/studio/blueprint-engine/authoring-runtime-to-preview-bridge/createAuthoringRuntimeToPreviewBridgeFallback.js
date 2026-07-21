import { BRIDGE_NAME, BRIDGE_VERSION, BRIDGE_MODE, BRIDGE_CAPABILITIES } from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';

/** Safe, fail-closed fallback for invalid bridge construction options. Never throws; authorizes nothing. */
export function createAuthoringRuntimeToPreviewBridgeFallback(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_bridge_options';
  return deepFreeze({
    kind: 'studio-authoring-runtime-to-preview-bridge',
    bridgeName: BRIDGE_NAME,
    bridgeVersion: BRIDGE_VERSION,
    mode: BRIDGE_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForHeadlessBridge: false,
    blockers: ['invalid_bridge_options'],
    blockerCount: 1,
    capabilities: { ...BRIDGE_CAPABILITIES },
    metadataOnly: true,
    execute() {
      return deepFreeze({
        kind: 'bridge-decision', ok: false, status: 'bridge_rejected', targetDescriptorCreated: false,
        targetDescriptor: null, issues: [], issueCount: 0, sourceMutated: false, sideEffects: 0,
      });
    },
  });
}

export default createAuthoringRuntimeToPreviewBridgeFallback;

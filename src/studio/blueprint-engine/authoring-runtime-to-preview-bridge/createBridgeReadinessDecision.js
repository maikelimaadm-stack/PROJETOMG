import { BRIDGE_READINESS_STATES } from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Decides bridge readiness. Ready for the HEADLESS bridge only; never for preview mount, authoring UI,
 * product exposure, module generation, certification or production. Pure.
 */
export function createBridgeReadinessDecision(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_authoring_runtime_to_preview_bridge_ready' : 'blocked';
  return deepFreeze({
    kind: 'bridge-readiness-decision',
    readiness,
    readyForHeadlessBridge: ready,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    blockers: [...blockers],
    blockerCount: blockers.length,
    knownState: BRIDGE_READINESS_STATES.includes(readiness),
  });
}

export default createBridgeReadinessDecision;

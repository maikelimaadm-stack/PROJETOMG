import { BRIDGE_CONTRACT_READINESS_STATES, bridgeDigest } from './bridgeContractConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Decides readiness of the bridge contract. Ready for the contract itself AND for a future bridge
 * IMPLEMENTATION PLAN; never for a real bridge implementation slice, preview mount, UI, permission/
 * tenancy integration, product exposure, module generation, certification or production. Pure.
 * @param {Object} [options] @returns {Object}
 */
export function createBridgeReadinessDecision(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const blockers = Array.isArray(o.blockers) ? o.blockers : [];
  const warnings = Array.isArray(o.warnings) ? o.warnings : [];
  const ready = blockers.length === 0;
  const readiness = ready ? 'studio_authoring_runtime_to_preview_bridge_contract_ready' : 'blocked';
  const core = {
    kind: 'bridge-readiness-decision',
    readiness,
    readyForBridgeContract: ready,
    readyForBridgeImplementationPlan: ready,
    readyForBridgeImplementationSlice: false,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    blockers: [...blockers],
    warnings: [...warnings],
    blockerCount: blockers.length,
    warningCount: warnings.length,
    knownState: BRIDGE_CONTRACT_READINESS_STATES.includes(readiness),
  };
  return safeCloneGenericModel({ ...core, readinessDigest: bridgeDigest(core) });
}

export default createBridgeReadinessDecision;

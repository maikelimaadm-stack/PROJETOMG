import {
  BRIDGE_CONTRACT_NAME, BRIDGE_CONTRACT_VERSION, BRIDGE_CONTRACT_MODE, BRIDGE_CONTRACT_CAPABILITIES, bridgeDigest,
} from './bridgeContractConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Safe, fail-closed fallback for an invalid/missing/fallback source handoff. Never throws; authorizes
 * nothing. Pure. @param {Object} [options] @returns {Object}
 */
export function createBridgeFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_source_handoff';
  const core = {
    kind: 'studio-authoring-runtime-to-preview-bridge-contract',
    bridgeContractName: BRIDGE_CONTRACT_NAME,
    bridgeContractVersion: BRIDGE_CONTRACT_VERSION,
    mode: BRIDGE_CONTRACT_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForBridgeContract: false,
    readyForBridgeImplementationPlan: false,
    readyForBridgeImplementationSlice: false,
    readyForPreviewMount: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForCertification: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundationBeforeExposure: true,
    blockers: ['invalid_or_missing_source_handoff'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...BRIDGE_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: bridgeDigest(core) });
}

export default createBridgeFallback;

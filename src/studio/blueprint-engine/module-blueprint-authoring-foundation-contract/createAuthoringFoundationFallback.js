import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_FOUNDATION_CONTRACT_NAME,
  AUTHORING_FOUNDATION_CONTRACT_VERSION,
  AUTHORING_FOUNDATION_CONTRACT_MODE,
  AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES,
  authoringFoundationDigest,
} from './authoringFoundationContractConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback certified blueprint contract.
 * Never throws; authorizes nothing. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createAuthoringFoundationFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_certified_blueprint';

  const core = {
    kind: 'studio-module-blueprint-authoring-foundation-contract',
    authoringFoundationContractName: AUTHORING_FOUNDATION_CONTRACT_NAME,
    authoringFoundationContractVersion: AUTHORING_FOUNDATION_CONTRACT_VERSION,
    mode: AUTHORING_FOUNDATION_CONTRACT_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForAuthoringFoundationContract: false,
    readyForAuthoringImplementationPlan: false,
    readyForAuthoringRuntime: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundation: true,
    blockers: ['invalid_or_missing_certified_blueprint'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...AUTHORING_FOUNDATION_CONTRACT_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: authoringFoundationDigest(core) });
}

export default createAuthoringFoundationFallback;

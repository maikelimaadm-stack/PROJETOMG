import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  AUTHORING_IMPLEMENTATION_PLAN_NAME,
  AUTHORING_IMPLEMENTATION_PLAN_VERSION,
  AUTHORING_IMPLEMENTATION_PLAN_MODE,
  AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES,
  authoringPlanDigest,
} from './authoringImplementationPlanConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback authoring foundation contract.
 * Never throws; authorizes nothing. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createAuthoringImplementationPlanFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_authoring_foundation_contract';

  const core = {
    kind: 'studio-module-blueprint-authoring-implementation-plan',
    authoringImplementationPlanName: AUTHORING_IMPLEMENTATION_PLAN_NAME,
    authoringImplementationPlanVersion: AUTHORING_IMPLEMENTATION_PLAN_VERSION,
    mode: AUTHORING_IMPLEMENTATION_PLAN_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForAuthoringImplementationPlan: false,
    readyForAuthoringRuntimeImplementationSlice: false,
    readyForAuthoringUi: false,
    readyForPermissionTenancyIntegration: false,
    readyForProductExposure: false,
    readyForModuleGeneration: false,
    readyForProduction: false,
    requiresPermissionTenancyFoundation: true,
    blockers: ['invalid_or_missing_authoring_foundation_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...AUTHORING_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: authoringPlanDigest(core) });
}

export default createAuthoringImplementationPlanFallback;

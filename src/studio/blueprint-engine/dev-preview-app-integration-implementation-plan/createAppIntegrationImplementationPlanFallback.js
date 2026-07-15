import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES,
  appIntegrationPlanDigest,
} from './appIntegrationImplementationPlanConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback App integration contract.
 * Never throws; authorizes nothing. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createAppIntegrationImplementationPlanFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_app_integration_contract';

  const core = {
    kind: 'studio-dev-preview-app-integration-implementation-plan',
    appIntegrationImplementationPlanName: APP_INTEGRATION_IMPLEMENTATION_PLAN_NAME,
    appIntegrationImplementationPlanVersion: APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
    mode: APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForAppIntegrationImplementationPlan: false,
    readyForAppIntegrationImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['invalid_or_missing_app_integration_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...APP_INTEGRATION_IMPLEMENTATION_PLAN_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, overallDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationImplementationPlanFallback;

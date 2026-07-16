import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG, appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Feature flag implementation PLAN — metadata for a future dev-only flag. It implements NO flag and
 * connects NOTHING to the App. Default off; production/staging denied. Pure and deterministic.
 * @returns {Object}
 */
export function createFeatureFlagImplementationPlan() {
  const core = {
    kind: 'app-integration-feature-flag-implementation-plan',
    flagNameMetadata: MAK_STUDIO_DEV_PREVIEW_APP_INTEGRATION_IMPLEMENTATION_PLAN_FLAG,
    featureFlagImplemented: false,
    featureFlagConnectedToApp: false,
    defaultEnabled: false,
    devOnly: true,
    productionAllowed: false,
    stagingAllowed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, featureFlagImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createFeatureFlagImplementationPlan;

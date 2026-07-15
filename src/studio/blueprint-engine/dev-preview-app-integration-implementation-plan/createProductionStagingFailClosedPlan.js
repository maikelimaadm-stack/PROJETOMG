import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Production/staging fail-closed PLAN — production and staging denied; default off; fail-closed.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createProductionStagingFailClosedPlan() {
  const core = {
    kind: 'app-integration-production-staging-fail-closed-plan',
    productionDenied: true,
    stagingDenied: true,
    defaultOff: true,
    failClosed: true,
  };
  return safeCloneGenericModel({ ...core, productionStagingFailClosedPlanDigest: appIntegrationPlanDigest(core) });
}

export default createProductionStagingFailClosedPlan;

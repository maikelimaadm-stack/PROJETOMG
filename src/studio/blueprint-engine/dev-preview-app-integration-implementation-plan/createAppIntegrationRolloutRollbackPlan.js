import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Rollout/rollback PLAN — rollout blocked; rollback by non-consumption or flag-off; no destructive
 * rollback required. Pure and deterministic.
 * @returns {Object}
 */
export function createAppIntegrationRolloutRollbackPlan() {
  const core = {
    kind: 'app-integration-rollout-rollback-plan',
    rolloutAllowed: false,
    productionRollout: false,
    stagingRollout: false,
    rollbackByNonConsumption: true,
    rollbackByFlagOff: true,
    destructiveRollbackRequired: false,
  };
  return safeCloneGenericModel({ ...core, rolloutRollbackPlanDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationRolloutRollbackPlan;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Rollout/rollback PLAN — rollout stays blocked until the enterprise checkpoint; rollback is by
 * non-consumption/flag-off, never destructive. Metadata only.
 * @returns {Object}
 */
export function createAuthoringRolloutRollbackPlan() {
  const core = {
    kind: 'authoring-rollout-rollback-plan',
    rolloutRollbackPlanned: true,
    rolloutBlocked: true,
    rolloutRequiresCheckpoint: true,
    rollbackByNonConsumption: true,
    rollbackByFlagOff: true,
    destructiveRollbackRequired: false,
    productionRolloutAllowed: false,
    stagingRolloutAllowed: false,
  };
  return safeCloneGenericModel({ ...core, rolloutRollbackPlanDigest: authoringPlanDigest(core) });
}

export default createAuthoringRolloutRollbackPlan;

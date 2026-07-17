import { REQUIRED_FUTURE_CHECKPOINT, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * ROLLOUT / ROLLBACK PLAN — rollout remains BLOCKED until the enterprise checkpoint passes; rollback is by
 * non-consumption (no external cleanup). No production/staging/product exposure. Metadata only.
 * @returns {Object}
 */
export function createBridgeRolloutRollbackPlan() {
  const core = {
    kind: 'bridge-rollout-rollback-plan',
    rolloutRollbackPlanOnly: true,
    rolloutBlocked: true,
    rolloutRequiresEnterpriseCheckpoint: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    productionRolloutAllowed: false,
    stagingRolloutAllowed: false,
    productExposureAllowed: false,
    rollbackByNonConsumption: true,
    externalCleanupRequired: false,
    reversible: true,
  };
  return safeCloneGenericModel({ ...core, rolloutRollbackPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeRolloutRollbackPlan;

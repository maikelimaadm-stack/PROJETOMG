import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans rollout/rollback. Rollout stays blocked; rollback is by non-consumption. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRuntimeUiRolloutRollbackPlan() {
  const core = {
    kind: 'runtime-ui-rollout-rollback-plan',
    rolloutAllowed: false,
    productionRollout: false,
    stagingRollout: false,
    rollbackByNonConsumption: true,
    rolloutImplemented: false,
  };
  return safeCloneGenericModel({ ...core, rolloutRollbackPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiRolloutRollbackPlan;

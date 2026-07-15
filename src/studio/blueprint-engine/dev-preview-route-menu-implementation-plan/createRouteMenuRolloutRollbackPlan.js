import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Rollout/rollback PLAN — rollout stays blocked; rollback by non-consumption. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRouteMenuRolloutRollbackPlan() {
  const core = {
    kind: 'route-menu-rollout-rollback-plan',
    rolloutAllowed: false,
    productionRollout: false,
    stagingRollout: false,
    rollbackByNonConsumption: true,
  };
  return safeCloneGenericModel({ ...core, rolloutRollbackDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuRolloutRollbackPlan;

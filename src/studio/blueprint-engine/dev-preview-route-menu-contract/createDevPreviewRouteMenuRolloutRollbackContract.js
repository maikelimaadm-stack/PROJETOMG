import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Rollout/rollback CONTRACT — rollout stays blocked; rollback is by non-consumption. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createDevPreviewRouteMenuRolloutRollbackContract() {
  const core = {
    kind: 'dev-preview-route-menu-rollout-rollback-contract',
    rolloutAllowed: false,
    productionRollout: false,
    stagingRollout: false,
    rollbackByNonConsumption: true,
  };
  return safeCloneGenericModel({ ...core, rolloutRollbackDigest: routeMenuDigest(core) });
}

export default createDevPreviewRouteMenuRolloutRollbackContract;

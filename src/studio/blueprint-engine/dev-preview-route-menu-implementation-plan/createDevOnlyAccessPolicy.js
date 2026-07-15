import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Dev-only access policy PLAN. Metadata only; authorizes nothing now. Pure and deterministic.
 * @returns {Object}
 */
export function createDevOnlyAccessPolicy() {
  const core = {
    kind: 'route-menu-dev-only-access-policy',
    devOnly: true,
    productionAllowed: false,
    stagingAllowed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
    requiredCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    requiresRuntimeUiReady: true,
    requiresSyntheticDataOnly: true,
  };
  return safeCloneGenericModel({ ...core, devOnlyAccessPolicyDigest: routeMenuPlanDigest(core) });
}

export default createDevOnlyAccessPolicy;

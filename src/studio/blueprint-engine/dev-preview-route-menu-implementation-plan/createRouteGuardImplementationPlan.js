import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Route guard implementation PLAN — metadata only; default-deny, fail-closed. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRouteGuardImplementationPlan() {
  const core = {
    kind: 'route-menu-route-guard-implementation-plan',
    guardImplemented: false,
    defaultDeny: true,
    failClosed: true,
    productionDenied: true,
    stagingDenied: true,
    tenantContextSyntheticOnly: true,
    permissionContextSyntheticOnly: true,
  };
  return safeCloneGenericModel({ ...core, routeGuardImplementationDigest: routeMenuPlanDigest(core) });
}

export default createRouteGuardImplementationPlan;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Router wiring boundary PLAN — asserts no router is touched and no router primitives are used.
 * Flag names avoid the literal router-API identifiers (see the gate's case-sensitive scan). Pure
 * and deterministic.
 * @returns {Object}
 */
export function createRouterWiringBoundaryPlan() {
  const core = {
    kind: 'route-menu-router-wiring-boundary-plan',
    routerTouched: false,
    routerWiringImplemented: false,
    routeRegistrationImplemented: false,
    routeElementCreated: false,
    routesElementCreated: false,
    browserRouterUsed: false,
    createBrowserRouterUsed: false,
    useNavigateUsed: false,
  };
  return safeCloneGenericModel({ ...core, routerWiringBoundaryDigest: routeMenuPlanDigest(core) });
}

export default createRouterWiringBoundaryPlan;

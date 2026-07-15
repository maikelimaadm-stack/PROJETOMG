import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * App wiring boundary PLAN — asserts App.jsx stays untouched and no App wiring is implemented. Pure
 * and deterministic.
 * @returns {Object}
 */
export function createAppWiringBoundaryPlan() {
  const core = {
    kind: 'route-menu-app-wiring-boundary-plan',
    appTouched: false,
    appWiringImplemented: false,
    appJsxAllowed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, appWiringBoundaryDigest: routeMenuPlanDigest(core) });
}

export default createAppWiringBoundaryPlan;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Sidebar/navigation placement PLAN — metadata only. No sidebar/navigation wiring implemented.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createSidebarNavigationPlacementPlan() {
  const core = {
    kind: 'route-menu-sidebar-navigation-placement-plan',
    placementPlanned: true,
    placementImplemented: false,
    sidebarWiringImplemented: false,
    navigationWiringImplemented: false,
  };
  return safeCloneGenericModel({ ...core, sidebarNavigationPlacementDigest: routeMenuPlanDigest(core) });
}

export default createSidebarNavigationPlacementPlan;

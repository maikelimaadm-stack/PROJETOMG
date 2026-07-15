import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Menu/sidebar exposure implementation PLAN — metadata only; asserts no menu/sidebar/navigation is
 * exposed to the product and no menu item is created. Pure and deterministic.
 * @returns {Object}
 */
export function createMenuSidebarExposureImplementationPlan() {
  const core = {
    kind: 'app-integration-menu-sidebar-exposure-implementation-plan',
    menuExposedToProduct: false,
    sidebarExposedToProduct: false,
    navigationExposedToProduct: false,
    menuItemCreated: false,
    sidebarWiringImplemented: false,
    futureExposure: 'dev_only_plan',
    requiresManualGate: true,
  };
  return safeCloneGenericModel({ ...core, menuSidebarExposureImplementationPlanDigest: appIntegrationPlanDigest(core) });
}

export default createMenuSidebarExposureImplementationPlan;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Menu visibility implementation PLAN — metadata only; not visible now. Pure and deterministic.
 * @returns {Object}
 */
export function createMenuVisibilityImplementationPlan() {
  const core = {
    kind: 'route-menu-menu-visibility-implementation-plan',
    visibilityImplemented: false,
    visibleNow: false,
    visibleInProduct: false,
    visibleInDevMenu: false,
    futureVisibility: 'planned_only',
  };
  return safeCloneGenericModel({ ...core, menuVisibilityImplementationDigest: routeMenuPlanDigest(core) });
}

export default createMenuVisibilityImplementationPlan;

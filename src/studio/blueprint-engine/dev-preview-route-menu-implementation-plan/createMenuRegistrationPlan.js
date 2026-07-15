import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Menu registration PLAN — metadata only. Nothing is registered in a real menu/sidebar. Pure and
 * deterministic.
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @returns {Object}
 */
export function createMenuRegistrationPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const mp = isGenericModelPlainObject(c.menuPlacement) ? c.menuPlacement : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'route-menu-menu-registration-plan',
    futureMenuId: String(mp.placementId ?? `dev-preview-menu-${moduleId}`),
    futureGroup: String(mp.futureGroup ?? 'studio_dev_preview'),
    futureOrder: typeof mp.futureOrder === 'number' ? mp.futureOrder : 9990,
    futureLabel: String(mp.futureLabel ?? `Dev Preview — ${moduleId}`),
    futureIconContract: String(mp.futureIconContract ?? 'studio_dev_preview_icon_contract'),
    registrationImplemented: false,
    menuCreated: false,
    sidebarTouched: false,
    navigationTouched: false,
  };
  return safeCloneGenericModel({ ...core, menuRegistrationDigest: routeMenuPlanDigest(core) });
}

export default createMenuRegistrationPlan;

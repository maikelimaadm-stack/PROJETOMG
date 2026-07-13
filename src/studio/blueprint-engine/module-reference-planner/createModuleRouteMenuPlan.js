import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { plannerDigest } from './moduleReferencePlannerConfig.js';

/**
 * Plans the ROUTE and MENU a module WOULD have. Pure. `routeCreated`/`menuCreated` are
 * false; production is not allowed; the route is dev-only/beta-only, flag- and
 * permission-guarded; App.jsx and the menu are not altered; auto-registration is off. A
 * real dev preview route requires its own future slice.
 *
 * @param {Object} [options]
 * @param {Object} [options.blueprint] normalized blueprint
 * @returns {Object} route/menu plan
 */
export function createModuleRouteMenuPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const b = isGenericModelPlainObject(o.blueprint) ? o.blueprint : {};
  const moduleId = String(b.moduleId ?? 'plannedModule').trim();

  const routePlan = {
    routeId: `${moduleId}-dev-preview`,
    routePath: `/__dev/studio/${moduleId}`,
    routeType: 'devPreview',
    devOnly: true,
    betaOnly: true,
    productionAllowed: false,
    guardRequired: true,
    flagRequired: true,
    permissionRequired: true,
    componentBinding: 'plannedOnly',
    fallbackRoute: '/__dev',
    diagnostics: { passive: true },
  };

  const menuPlan = {
    menuId: `${moduleId}-menu`,
    label: String(b.moduleName ?? moduleId).trim(),
    group: 'studioBeta',
    order: 999,
    icon: 'planned',
    visibilityPolicy: 'betaFlagAndPermission',
    permissionRequired: true,
    betaOnly: true,
    productionAllowed: false,
    flagRequired: true,
  };

  const core = {
    kind: 'module-route-menu-plan',
    moduleId,
    routePlan,
    menuPlan,
    routeCreated: false,
    menuCreated: false,
    productionAllowed: false,
    guardRequired: true,
    flagRequired: true,
    permissionRequired: true,
    autoRegister: false,
    changesAppJsx: false,
    changesMenu: false,
    devPreviewRequiresOwnSlice: true,
  };

  return safeCloneGenericModel({ ...core, routeMenuPlanDigest: plannerDigest(core) });
}

export default createModuleRouteMenuPlan;

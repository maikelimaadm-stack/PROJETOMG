import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createStudioContractDigest } from './createStudioContractDigest.js';

/**
 * The Route/Menu Blueprint contract. Pure. Nothing auto-registers; App.jsx/menu are
 * never touched; production/route/menu default off; a future controlled registry +
 * flag rollback are required.
 *
 * @param {Object} [options]
 * @returns {Object} route/menu blueprint contract descriptor
 */
export function createStudioRouteMenuBlueprintContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const routePlan = {
    fields: ['routeId', 'routePath', 'routeType', 'devOnly', 'betaOnly', 'productionAllowed', 'guardRequired', 'flagRequired', 'permissionRequired', 'componentBinding', 'fallbackRoute', 'diagnostics'],
    defaults: { routeEnabled: false, productionAllowed: false, guardRequired: true, flagRequired: true },
  };
  const menuPlan = {
    fields: ['menuId', 'label', 'group', 'order', 'icon', 'visibilityPolicy', 'permissionRequired', 'betaOnly', 'productionAllowed', 'flagRequired', 'diagnostics'],
    defaults: { menuVisible: false, productionAllowed: false, flagRequired: true },
  };

  const body = {
    kind: 'studio-route-menu-blueprint-contract',
    routePlan,
    menuPlan,
    routeEnabledDefault: false,
    menuVisibleDefault: false,
    productionAllowedDefault: false,
    appJsxChanged: false,
    menuChanged: false,
    automaticRegistration: false,
    futureRegistryRequired: true,
    flagRollbackRequired: true,
    rules: [
      'routeEnabled default false', 'menuVisible default false', 'productionAllowed default false',
      'App.jsx is not changed', 'menu is not changed', 'no automatic registration',
      'future controlled registry required', 'flag rollback required',
    ],
  };
  return safeCloneGenericModel({ ...body, routeMenuDigest: createStudioContractDigest({ value: { routePlan, menuPlan } }) });
}

export default createStudioRouteMenuBlueprintContract;

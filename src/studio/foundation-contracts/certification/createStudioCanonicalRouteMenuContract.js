import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { certificationDigest } from './createStudioBlueprintCertificationDigest.js';

/**
 * Certifies the canonical route/menu contract. Pure. route/menu default off; nothing
 * auto-registers; App.jsx/menu never change; public route blocked; guard/flag/
 * permission required.
 *
 * @param {Object} [options]
 * @returns {Object} canonical route/menu contract
 */
export function createStudioCanonicalRouteMenuContract(options = {}) {
  void options;
  const routePlan = {
    fields: ['routeId', 'routePath', 'routeType', 'devOnly', 'betaOnly', 'productionAllowed', 'guardRequired', 'flagRequired', 'permissionRequired', 'componentBinding', 'fallbackRoute', 'diagnostics'],
    defaults: { routeEnabled: false, productionAllowed: false, guardRequired: true, flagRequired: true, permissionRequired: true },
  };
  const menuPlan = {
    fields: ['menuId', 'label', 'group', 'order', 'icon', 'visibilityPolicy', 'permissionRequired', 'betaOnly', 'productionAllowed', 'flagRequired', 'diagnostics'],
    defaults: { menuVisible: false, productionAllowed: false, flagRequired: true, permissionRequired: true },
  };

  const body = {
    kind: 'studio-canonical-route-menu-contract',
    routePlan,
    menuPlan,
    routeEnabledDefault: false,
    menuVisibleDefault: false,
    productionAllowedDefault: false,
    autoRegister: false,
    appJsxChanged: false,
    menuChanged: false,
    publicRouteAllowed: false,
    guardFlagPermissionRequired: true,
  };
  return safeCloneGenericModel({ ...body, canonicalRouteMenuContractDigest: certificationDigest({ routePlan, menuPlan }) });
}

export default createStudioCanonicalRouteMenuContract;

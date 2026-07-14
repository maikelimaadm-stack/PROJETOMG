import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Menu placement CONTRACT — metadata only. No menu created, no menu item registered, no sidebar
 * or navigation touched. Pure and deterministic.
 * @param {Object} [options]
 * @param {Object} [options.runtimeUi]
 * @returns {Object}
 */
export function createDevPreviewMenuPlacementContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ui = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : {};
  const moduleId = String(ui.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-menu-placement-contract',
    placementId: `dev-preview-menu-${moduleId}`,
    futureGroup: 'studio_dev_preview',
    futureOrder: 9990,
    futureLabel: `Dev Preview — ${moduleId}`,
    futureIconContract: 'studio_dev_preview_icon_contract',
    menuCreated: false,
    menuItemRegistered: false,
    sidebarTouched: false,
    navigationTouched: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, menuPlacementDigest: routeMenuDigest(core) });
}

export default createDevPreviewMenuPlacementContract;

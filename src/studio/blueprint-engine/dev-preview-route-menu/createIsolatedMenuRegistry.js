import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_ROUTE_PATHS, routeMenuDigest } from './routeMenuConfig.js';

/**
 * The isolated menu registry. Registers ONLY host-local menu items; nothing is registered in the
 * product menu/sidebar. Pure and deterministic.
 * @returns {Object}
 */
export function createIsolatedMenuRegistry() {
  const items = [
    { menuId: 'dev-preview-menu-preview', label: 'Preview', routeId: 'dev-preview-route-0', path: ISOLATED_ROUTE_PATHS[0] },
  ].map((it) => ({
    ...it,
    visibleOnlyWhenDevGateOpen: true,
    productMenu: false,
    productSidebar: false,
  }));
  const core = {
    kind: 'route-menu-isolated-menu-registry',
    items,
    itemCount: items.length,
    anyProductMenu: items.some((x) => x.productMenu === true),
    anyProductSidebar: items.some((x) => x.productSidebar === true),
    allVisibleOnlyWhenDevGateOpen: items.every((x) => x.visibleOnlyWhenDevGateOpen === true),
  };
  return safeCloneGenericModel({ ...core, menuRegistryDigest: routeMenuDigest(core) });
}

export default createIsolatedMenuRegistry;

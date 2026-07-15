import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  routeMenuDigest,
} from './routeMenuConfig.js';

/**
 * Loads upstream contract references consumed by the isolated route/menu runtime, by relative pure
 * import only. No fetch, no network, no dynamic path. Never throws.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @returns {Object}
 */
export function createRouteMenuContractLoader(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};

  const core = {
    kind: 'route-menu-contract-loader',
    loadedByRelativeImportOnly: true,
    usesFetch: false,
    usesNetwork: false,
    usesDynamicPath: false,
    loaded: {
      routeMenuContract: ROUTE_MENU_CONTRACT_VERSION,
      routeMenuImplementationPlan: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
      runtimeUi: RUNTIME_UI_VERSION,
      runtimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
      isolatedRuntime: ISOLATED_RUNTIME_VERSION,
    },
    routeMenuContractPresent: c.kind === 'studio-dev-preview-route-menu-contract',
  };
  return safeCloneGenericModel({ ...core, contractLoaderDigest: routeMenuDigest(core) });
}

export default createRouteMenuContractLoader;

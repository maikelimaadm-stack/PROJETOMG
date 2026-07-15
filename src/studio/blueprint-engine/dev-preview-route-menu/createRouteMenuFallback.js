import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_NAME,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_MODE,
  ROUTE_MENU_CAPABILITIES,
  routeMenuDigest,
} from './routeMenuConfig.js';

/**
 * Builds a safe, fail-closed fallback for an invalid/missing/fallback input or a failed preflight.
 * Never throws; mounts nothing; authorizes nothing. Pure and deterministic. (The renderable
 * blocked/not-found React lives in the sibling `.jsx` files; this returns the metadata fallback.)
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object}
 */
export function createRouteMenuFallback(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const reason = typeof o.reason === 'string' && o.reason.length > 0 ? o.reason : 'invalid_or_missing_route_menu_contract';

  const core = {
    kind: 'studio-dev-preview-route-menu',
    routeMenuName: ROUTE_MENU_NAME,
    routeMenuVersion: ROUTE_MENU_VERSION,
    mode: ROUTE_MENU_MODE,
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForIsolatedRouteMenuRuntime: false,
    readyForAppIntegration: false,
    readyForProductRouterIntegration: false,
    readyForProductMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['invalid_or_missing_route_menu_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...ROUTE_MENU_CAPABILITIES, routeImplemented: false, menuImplemented: false, isolatedMenuUiImplemented: false, routeViewImplemented: false, mountAdapterImplemented: false, runtimeUiMountCapabilityImplemented: false },
  };
  return safeCloneGenericModel({ ...core, overallDigest: routeMenuDigest(core) });
}

export default createRouteMenuFallback;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_ROUTE_PATHS, routeMenuDigest } from './routeMenuConfig.js';

/**
 * The isolated route registry. Registers ONLY host-internal paths; nothing is registered in the
 * product router. Pure and deterministic.
 * @returns {Object}
 */
export function createIsolatedRouteRegistry() {
  const routes = ISOLATED_ROUTE_PATHS.map((path, i) => ({
    routeId: `dev-preview-route-${i}`,
    path,
    screenKind: path.endsWith('not-found') ? 'notFound' : 'preview',
    requiresDevFlag: true,
    requiresSyntheticData: true,
    productRoute: false,
    publicRoute: false,
  }));
  const core = {
    kind: 'route-menu-isolated-route-registry',
    routes,
    routeCount: routes.length,
    allInternal: routes.every((r) => r.productRoute === false && r.publicRoute === false),
    anyProductRoute: routes.some((r) => r.productRoute === true),
    anyPublicRoute: routes.some((r) => r.publicRoute === true),
  };
  return safeCloneGenericModel({ ...core, routeRegistryDigest: routeMenuDigest(core) });
}

export default createIsolatedRouteRegistry;

import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_ROUTE_PATHS, routeMenuDigest } from './routeMenuConfig.js';

/**
 * Resolves a local path STRING (received by argument) against the isolated route registry. It never
 * reads `window.location`, `history`, or any browser API. Unknown paths resolve to the isolated
 * not-found route. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {string} [options.path]
 * @returns {Object}
 */
export function createIsolatedRouteResolver(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const requested = typeof o.path === 'string' ? o.path : ISOLATED_ROUTE_PATHS[0];
  const known = ISOLATED_ROUTE_PATHS.includes(requested);
  const resolvedPath = known ? requested : ISOLATED_ROUTE_PATHS[1];

  const core = {
    kind: 'route-menu-isolated-route-resolver',
    requestedPath: requested,
    resolvedPath,
    matched: known,
    screenKind: resolvedPath.endsWith('not-found') ? 'notFound' : 'preview',
    usesWindowLocation: false,
    usesHistory: false,
    usesReactRouter: false,
    productRoute: false,
  };
  return safeCloneGenericModel({ ...core, routeResolverDigest: routeMenuDigest(core) });
}

export default createIsolatedRouteResolver;

import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_ROUTE_PATHS, routeMenuDigest } from './routeMenuConfig.js';
import { createIsolatedRouteResolver } from './createIsolatedRouteResolver.js';

/**
 * Creates a LOCAL navigation controller for the isolated host. It controls only a local path
 * snapshot via a closure; it never mutates browser history, never changes the global URL, never
 * navigates the App, and never opens a product route. `onChange` (injected) is invoked with the new
 * snapshot for re-render. Returns a controller object plus a deterministic descriptor.
 *
 * @param {Object} [options]
 * @param {string} [options.initialPath]
 * @param {(snapshot: Object) => void} [options.onChange]
 * @returns {Object}
 */
export function createIsolatedNavigationController(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const onChange = typeof o.onChange === 'function' ? o.onChange : null;
  let currentPath = typeof o.initialPath === 'string' ? o.initialPath : ISOLATED_ROUTE_PATHS[0];

  const snapshot = () => {
    const resolved = createIsolatedRouteResolver({ path: currentPath });
    return { path: currentPath, resolvedPath: resolved.resolvedPath, screenKind: resolved.screenKind, matched: resolved.matched };
  };

  const controller = {
    kind: 'route-menu-isolated-navigation-controller',
    navigateLocal(nextPath) {
      currentPath = typeof nextPath === 'string' ? nextPath : currentPath;
      const snap = snapshot();
      if (onChange) onChange(snap);
      return snap;
    },
    getSnapshot() { return snapshot(); },
    mutatesBrowserHistory: false,
    changesGlobalUrl: false,
    navigatesApp: false,
    opensProductRoute: false,
  };

  const descriptorCore = {
    kind: 'route-menu-navigation-controller-descriptor',
    initialPath: currentPath,
    mutatesBrowserHistory: false,
    changesGlobalUrl: false,
    navigatesApp: false,
    opensProductRoute: false,
    localOnly: true,
  };
  const descriptor = safeCloneGenericModel({ ...descriptorCore, navigationControllerDigest: routeMenuDigest(descriptorCore) });

  return { controller, descriptor };
}

export default createIsolatedNavigationController;

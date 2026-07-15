import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_VERSION,
  ROUTE_MENU_MODE,
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_UI_VERSION,
  ISOLATED_RUNTIME_VERSION,
  routeMenuDigest,
} from './routeMenuConfig.js';

/**
 * Builds the deterministic isolated dev-only session from a route/menu contract. Pure — no storage,
 * no fetch, no persistence, no external side-effects, no window/document. Same input -> same session.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @returns {Object}
 */
export function createRouteMenuSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'route-menu-session',
    sessionId: `${moduleId}#dev-preview-route-menu`,
    routeMenuVersion: ROUTE_MENU_VERSION,
    sourceRouteMenuContract: ROUTE_MENU_CONTRACT_VERSION,
    sourceRouteMenuImplementationPlan: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    sourceRuntimeUi: RUNTIME_UI_VERSION,
    sourceIsolatedRuntime: ISOLATED_RUNTIME_VERSION,
    mode: ROUTE_MENU_MODE,
    createdFrom: 'studio-dev-preview-route-menu-contract',
    devOnly: true,
    isolated: true,
    defaultOff: true,
    syntheticDataOnly: true,
    seed: `route-menu:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: routeMenuDigest(core) });
}

export default createRouteMenuSession;

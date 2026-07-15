import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
  ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
  ROUTE_MENU_CONTRACT_VERSION,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  routeMenuPlanDigest,
} from './routeMenuImplementationPlanConfig.js';

/**
 * Builds the deterministic PLAN session from a route/menu contract. Pure — no storage, no fetch,
 * no persistence, no external side-effects. Same input -> same session + digest.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @returns {Object}
 */
export function createRouteMenuImplementationPlanSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'route-menu-implementation-plan-session',
    sessionId: `${moduleId}#dev-preview-route-menu-implementation-plan`,
    routeMenuImplementationPlanVersion: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    sourceRouteMenuContract: ROUTE_MENU_CONTRACT_VERSION,
    sourceRuntimeUi: RUNTIME_UI_VERSION,
    sourceRuntimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
    sourceIsolatedRuntime: ISOLATED_RUNTIME_VERSION,
    mode: ROUTE_MENU_IMPLEMENTATION_PLAN_MODE,
    createdFrom: 'studio-dev-preview-route-menu-contract',
    seed: `route-menu-implementation-plan:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: routeMenuPlanDigest(core) });
}

export default createRouteMenuImplementationPlanSession;

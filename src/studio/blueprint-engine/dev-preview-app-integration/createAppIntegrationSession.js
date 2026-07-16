import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_VERSION,
  APP_INTEGRATION_MODE,
  APP_INTEGRATION_CONTRACT_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  appIntegrationDigest,
} from './appIntegrationConfig.js';

/**
 * Deterministic session for the App integration. Pure — no storage, no fetch, no persistence, no
 * side-effects. Same input -> same session + digest.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime]
 * @returns {Object}
 */
export function createAppIntegrationSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const r = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : {};
  const moduleId = String(r.moduleId ?? 'plannedModule');

  const core = {
    kind: 'app-integration-session',
    sessionId: `${moduleId}#dev-preview-app-integration`,
    appIntegrationVersion: APP_INTEGRATION_VERSION,
    sourceAppIntegrationContract: APP_INTEGRATION_CONTRACT_VERSION,
    sourceRouteMenuRuntime: ROUTE_MENU_VERSION,
    sourceRuntimeUi: RUNTIME_UI_VERSION,
    mode: APP_INTEGRATION_MODE,
    createdFrom: 'studio-dev-preview-route-menu',
    seed: `app-integration:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationSession;

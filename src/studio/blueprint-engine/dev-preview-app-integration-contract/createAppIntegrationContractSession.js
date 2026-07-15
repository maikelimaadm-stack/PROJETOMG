import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_CONTRACT_VERSION,
  APP_INTEGRATION_CONTRACT_MODE,
  ROUTE_MENU_VERSION,
  ROUTE_MENU_CONTRACT_VERSION,
  RUNTIME_UI_VERSION,
  appIntegrationDigest,
} from './appIntegrationContractConfig.js';

/**
 * Builds the deterministic CONTRACT session from a route/menu runtime. Pure — no storage, no fetch,
 * no persistence, no external side-effects. Same input -> same session + digest.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime]
 * @returns {Object}
 */
export function createAppIntegrationContractSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const r = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : {};
  const moduleId = String(r.moduleId ?? 'plannedModule');

  const core = {
    kind: 'app-integration-contract-session',
    sessionId: `${moduleId}#dev-preview-app-integration-contract`,
    appIntegrationContractVersion: APP_INTEGRATION_CONTRACT_VERSION,
    sourceRouteMenuRuntime: ROUTE_MENU_VERSION,
    sourceRouteMenuContract: ROUTE_MENU_CONTRACT_VERSION,
    sourceRuntimeUi: RUNTIME_UI_VERSION,
    mode: APP_INTEGRATION_CONTRACT_MODE,
    createdFrom: 'studio-dev-preview-route-menu',
    seed: `app-integration-contract:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: appIntegrationDigest(core) });
}

export default createAppIntegrationContractSession;

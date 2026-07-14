import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ROUTE_MENU_CONTRACT_VERSION,
  ROUTE_MENU_CONTRACT_MODE,
  RUNTIME_UI_VERSION,
  RUNTIME_UI_CONTRACT_VERSION,
  ISOLATED_RUNTIME_VERSION,
  RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  routeMenuDigest,
} from './routeMenuContractConfig.js';

/**
 * Builds the deterministic contract session from a runtime UI. Pure — no storage, no fetch, no
 * persistence, no external side-effects. Same input -> same session + digest.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUi]
 * @returns {Object}
 */
export function createRouteMenuContractSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ui = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : {};
  const moduleId = String(ui.moduleId ?? 'plannedModule');

  const core = {
    kind: 'route-menu-contract-session',
    sessionId: `${moduleId}#dev-preview-route-menu-contract`,
    routeMenuContractVersion: ROUTE_MENU_CONTRACT_VERSION,
    sourceRuntimeUi: RUNTIME_UI_VERSION,
    sourceRuntimeUiContract: RUNTIME_UI_CONTRACT_VERSION,
    sourceIsolatedRuntime: ISOLATED_RUNTIME_VERSION,
    sourceRuntimeUiImplementationPlan: RUNTIME_UI_IMPLEMENTATION_PLAN_VERSION,
    sourceRuntimeShellContract: RUNTIME_SHELL_CONTRACT_VERSION,
    sourceVisualContract: VISUAL_CONTRACT_VERSION,
    mode: ROUTE_MENU_CONTRACT_MODE,
    createdFrom: 'studio-dev-preview-runtime-ui',
    devOnly: true,
    isolated: true,
    seed: `route-menu-contract:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: routeMenuDigest(core) });
}

export default createRouteMenuContractSession;

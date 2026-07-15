import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
  APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
  APP_INTEGRATION_CONTRACT_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  appIntegrationPlanDigest,
} from './appIntegrationImplementationPlanConfig.js';

/**
 * Builds the deterministic PLAN session from an App integration contract. Pure — no storage, no
 * fetch, no persistence, no external side-effects. Same input -> same session + digest.
 *
 * @param {Object} [options]
 * @param {Object} [options.appIntegrationContract]
 * @returns {Object}
 */
export function createAppIntegrationImplementationPlanSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.appIntegrationContract) ? o.appIntegrationContract : {};
  const moduleId = String(c.moduleId ?? 'plannedModule');

  const core = {
    kind: 'app-integration-implementation-plan-session',
    sessionId: `${moduleId}#dev-preview-app-integration-implementation-plan`,
    appIntegrationImplementationPlanVersion: APP_INTEGRATION_IMPLEMENTATION_PLAN_VERSION,
    sourceAppIntegrationContract: APP_INTEGRATION_CONTRACT_VERSION,
    sourceRouteMenuRuntime: ROUTE_MENU_VERSION,
    sourceRuntimeUi: RUNTIME_UI_VERSION,
    mode: APP_INTEGRATION_IMPLEMENTATION_PLAN_MODE,
    createdFrom: 'studio-dev-preview-app-integration-contract',
    seed: `app-integration-implementation-plan:${moduleId}`,
    usesStorage: false,
    usesFetch: false,
    usesPersistence: false,
    runtimeSideEffects: false,
  };
  return safeCloneGenericModel({ ...core, sessionDigest: appIntegrationPlanDigest(core) });
}

export default createAppIntegrationImplementationPlanSession;

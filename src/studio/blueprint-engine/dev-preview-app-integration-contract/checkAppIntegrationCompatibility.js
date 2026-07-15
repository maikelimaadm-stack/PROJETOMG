import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_VERSION, RUNTIME_UI_VERSION, appIntegrationDigest } from './appIntegrationContractConfig.js';

/**
 * Checks compatibility of the contract with its upstream route/menu runtime + runtime UI. Ready for
 * the contract itself; NEVER authorizes a real implementation plan/slice, App integration, real
 * module generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuRuntime]
 * @returns {Object}
 */
export function checkAppIntegrationCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const r = isGenericModelPlainObject(o.routeMenuRuntime) ? o.routeMenuRuntime : {};
  const warnings = [];

  const compatibleWithRouteMenuRuntime = String(r.routeMenuVersion ?? '') === ROUTE_MENU_VERSION || r.kind === 'studio-dev-preview-route-menu';
  const compatibleWithRuntimeUi = String(r.runtimeUiVersion ?? RUNTIME_UI_VERSION) === RUNTIME_UI_VERSION;
  if (!compatibleWithRouteMenuRuntime) warnings.push('incompatible_routeMenuRuntime');
  if (!compatibleWithRuntimeUi) warnings.push('incompatible_runtimeUi');
  if (r.readyForIsolatedRouteMenuRuntime === false) warnings.push('route_menu_runtime_not_ready');

  const core = {
    kind: 'app-integration-compatibility',
    compatibleWithRouteMenuRuntime,
    compatibleWithRuntimeUi,
    readyForAppIntegrationContract: compatibleWithRouteMenuRuntime && compatibleWithRuntimeUi,
    readyForAppIntegrationImplementationPlan: false,
    readyForAppIntegrationImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_app_integration_implementation_plan_when_explicitly_authorized',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: appIntegrationDigest(core) });
}

export default checkAppIntegrationCompatibility;

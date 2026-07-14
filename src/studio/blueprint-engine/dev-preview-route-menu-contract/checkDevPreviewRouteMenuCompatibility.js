import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_VERSION, routeMenuDigest } from './routeMenuContractConfig.js';

/**
 * Checks compatibility of the route/menu contract with its upstream runtime UI. Ready for the
 * contract itself; NEVER authorizes a real implementation, App integration, real module
 * generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUi]
 * @returns {Object}
 */
export function checkDevPreviewRouteMenuCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ui = isGenericModelPlainObject(o.runtimeUi) ? o.runtimeUi : {};
  const warnings = [];

  const compatibleWithRuntimeUi = String(ui.runtimeUiVersion ?? '') === RUNTIME_UI_VERSION;
  if (!compatibleWithRuntimeUi) warnings.push('incompatible_runtimeUi');
  if (ui.readyForRuntimeUi === false) warnings.push('runtime_ui_not_ready');

  const core = {
    kind: 'dev-preview-route-menu-compatibility',
    compatibleWithRuntimeUi,
    readyForRouteMenuContract: compatibleWithRuntimeUi,
    readyForRouteMenuImplementation: false,
    readyForAppIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_route_menu_implementation_plan_after_enterprise_checkpoint',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: routeMenuDigest(core) });
}

export default checkDevPreviewRouteMenuCompatibility;

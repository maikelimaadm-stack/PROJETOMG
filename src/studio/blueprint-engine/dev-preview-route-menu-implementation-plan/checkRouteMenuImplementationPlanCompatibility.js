import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_CONTRACT_VERSION, RUNTIME_UI_VERSION, routeMenuPlanDigest } from './routeMenuImplementationPlanConfig.js';

/**
 * Checks compatibility of the plan with its upstream route/menu contract + runtime UI. Ready for
 * the plan itself; NEVER authorizes a real implementation slice, App integration, real module
 * generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @returns {Object}
 */
export function checkRouteMenuImplementationPlanCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const warnings = [];

  const compatibleWithRouteMenuContract = String(c.routeMenuContractVersion ?? '') === ROUTE_MENU_CONTRACT_VERSION;
  const compatibleWithRuntimeUi = String(c.runtimeUiVersion ?? '') === RUNTIME_UI_VERSION;
  if (!compatibleWithRouteMenuContract) warnings.push('incompatible_routeMenuContract');
  if (!compatibleWithRuntimeUi) warnings.push('incompatible_runtimeUi');
  if (c.readyForRouteMenuContract === false) warnings.push('route_menu_contract_not_ready');

  const core = {
    kind: 'route-menu-implementation-plan-compatibility',
    compatibleWithRouteMenuContract,
    compatibleWithRuntimeUi,
    readyForRouteMenuImplementationPlan: compatibleWithRouteMenuContract && compatibleWithRuntimeUi,
    readyForRouteMenuImplementationSlice: false,
    readyForAppIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_route_menu_implementation_slice_after_enterprise_checkpoint',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: routeMenuPlanDigest(core) });
}

export default checkRouteMenuImplementationPlanCompatibility;

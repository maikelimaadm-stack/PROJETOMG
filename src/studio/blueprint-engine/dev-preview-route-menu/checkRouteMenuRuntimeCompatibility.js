import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ROUTE_MENU_CONTRACT_VERSION, ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION, RUNTIME_UI_VERSION, routeMenuDigest } from './routeMenuConfig.js';

/**
 * Checks compatibility of the isolated route/menu runtime with its upstream contract, implementation
 * plan and runtime UI. Ready for the isolated runtime; NEVER authorizes App integration, product
 * router/menu integration, real module generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.routeMenuContract]
 * @returns {Object}
 */
export function checkRouteMenuRuntimeCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.routeMenuContract) ? o.routeMenuContract : {};
  const warnings = [];

  const compatibleWithRouteMenuContract = String(c.routeMenuContractVersion ?? '') === ROUTE_MENU_CONTRACT_VERSION || c.kind === 'studio-dev-preview-route-menu-contract';
  const compatibleWithRouteMenuImplementationPlan = String(c.routeMenuContractVersion ?? ROUTE_MENU_CONTRACT_VERSION) === ROUTE_MENU_CONTRACT_VERSION;
  const compatibleWithRuntimeUi = String(c.runtimeUiVersion ?? RUNTIME_UI_VERSION) === RUNTIME_UI_VERSION;
  if (!compatibleWithRouteMenuContract) warnings.push('incompatible_routeMenuContract');
  if (!compatibleWithRuntimeUi) warnings.push('incompatible_runtimeUi');

  const core = {
    kind: 'route-menu-runtime-compatibility',
    compatibleWithRouteMenuContract,
    compatibleWithRouteMenuImplementationPlan,
    compatibleWithRuntimeUi,
    implementationPlanVersion: ROUTE_MENU_IMPLEMENTATION_PLAN_VERSION,
    readyForIsolatedRouteMenuRuntime: compatibleWithRouteMenuContract && compatibleWithRuntimeUi,
    readyForAppIntegration: false,
    readyForProductRouterIntegration: false,
    readyForProductMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_app_integration_contract_after_enterprise_checkpoint',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: routeMenuDigest(core) });
}

export default checkRouteMenuRuntimeCompatibility;

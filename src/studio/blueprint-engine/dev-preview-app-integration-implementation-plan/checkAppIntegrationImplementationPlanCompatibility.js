import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { APP_INTEGRATION_CONTRACT_VERSION, ROUTE_MENU_VERSION, RUNTIME_UI_VERSION, appIntegrationPlanDigest } from './appIntegrationImplementationPlanConfig.js';

/**
 * Checks compatibility of the plan with its upstream App integration contract + route/menu runtime +
 * runtime UI. Ready for the plan itself; NEVER authorizes a real implementation slice, App
 * integration, real module generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.appIntegrationContract]
 * @returns {Object}
 */
export function checkAppIntegrationImplementationPlanCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.appIntegrationContract) ? o.appIntegrationContract : {};
  const warnings = [];

  const compatibleWithAppIntegrationContract = String(c.appIntegrationContractVersion ?? '') === APP_INTEGRATION_CONTRACT_VERSION || c.kind === 'studio-dev-preview-app-integration-contract';
  const compatibleWithRouteMenuRuntime = String(c.routeMenuVersion ?? ROUTE_MENU_VERSION) === ROUTE_MENU_VERSION;
  const compatibleWithRuntimeUi = String(c.runtimeUiVersion ?? RUNTIME_UI_VERSION) === RUNTIME_UI_VERSION;
  if (!compatibleWithAppIntegrationContract) warnings.push('incompatible_appIntegrationContract');
  if (!compatibleWithRouteMenuRuntime) warnings.push('incompatible_routeMenuRuntime');
  if (!compatibleWithRuntimeUi) warnings.push('incompatible_runtimeUi');
  if (c.readyForAppIntegrationContract === false) warnings.push('app_integration_contract_not_ready');

  const core = {
    kind: 'app-integration-implementation-plan-compatibility',
    compatibleWithAppIntegrationContract,
    compatibleWithRouteMenuRuntime,
    compatibleWithRuntimeUi,
    readyForAppIntegrationImplementationPlan: compatibleWithAppIntegrationContract && compatibleWithRouteMenuRuntime && compatibleWithRuntimeUi,
    readyForAppIntegrationImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_app_integration_implementation_slice_after_enterprise_checkpoint',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: appIntegrationPlanDigest(core) });
}

export default checkAppIntegrationImplementationPlanCompatibility;

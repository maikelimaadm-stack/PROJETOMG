import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  APP_INTEGRATION_CONTRACT_VERSION,
  ROUTE_MENU_VERSION,
  RUNTIME_UI_VERSION,
  appIntegrationDigest,
} from './appIntegrationConfig.js';

/**
 * Checks compatibility of the integration with its upstream route-menu runtime + app-integration
 * contract + runtime UI. Ready for the dev-only App integration; NEVER ready for product exposure,
 * real module generation, or production. Pure and deterministic.
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
  const compatibleWithContract = String(r.appIntegrationContractVersion ?? APP_INTEGRATION_CONTRACT_VERSION) === APP_INTEGRATION_CONTRACT_VERSION;
  if (!compatibleWithRouteMenuRuntime) warnings.push('incompatible_routeMenuRuntime');
  if (!compatibleWithRuntimeUi) warnings.push('incompatible_runtimeUi');
  if (r.readyForIsolatedRouteMenuRuntime === false) warnings.push('route_menu_runtime_not_ready');

  const core = {
    kind: 'app-integration-compatibility',
    compatibleWithRouteMenuRuntime,
    compatibleWithRuntimeUi,
    compatibleWithAppIntegrationContract: compatibleWithContract,
    readyForAppIntegration: compatibleWithRouteMenuRuntime && compatibleWithRuntimeUi,
    readyForProductExposure: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_dev_only_app_integration_default_off_fail_closed',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: appIntegrationDigest(core) });
}

export default checkAppIntegrationCompatibility;

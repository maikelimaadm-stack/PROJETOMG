import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_CONTRACT_VERSION, ISOLATED_RUNTIME_VERSION, runtimeUiDigest } from './runtimeUiConfig.js';

/**
 * Checks compatibility of the runtime UI with its upstream runtime UI contract + isolated runtime.
 * Ready for the isolated runtime UI; NEVER authorizes route/menu integration, real module
 * generation, or production. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @returns {Object}
 */
export function checkRuntimeUiCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const warnings = [];

  const compatibleWithRuntimeUiContract = String(c.runtimeUiContractVersion ?? '') === RUNTIME_UI_CONTRACT_VERSION;
  const compatibleWithIsolatedRuntime = String(c.isolatedRuntimeVersion ?? '') === ISOLATED_RUNTIME_VERSION;
  if (!compatibleWithRuntimeUiContract) warnings.push('incompatible_runtimeUiContract');
  if (!compatibleWithIsolatedRuntime) warnings.push('incompatible_isolatedRuntime');

  const core = {
    kind: 'runtime-ui-compatibility',
    compatibleWithRuntimeUiContract,
    compatibleWithIsolatedRuntime,
    readyForRuntimeUi: compatibleWithRuntimeUiContract && compatibleWithIsolatedRuntime,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_dev_preview_route_menu_contract_when_explicitly_authorized',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: runtimeUiDigest(core) });
}

export default checkRuntimeUiCompatibility;

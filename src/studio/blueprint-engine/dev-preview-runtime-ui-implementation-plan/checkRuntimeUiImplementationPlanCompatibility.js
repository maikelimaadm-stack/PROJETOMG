import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RUNTIME_UI_CONTRACT_VERSION, uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Checks compatibility of the plan with its upstream runtime UI contract. Ready for the plan
 * itself; NEVER authorizes a real implementation slice, route/placement integration, real module
 * generation, or production. Even if a future readiness is true, this slice authorizes nothing
 * real. Pure and deterministic.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeUiContract]
 * @returns {Object}
 */
export function checkRuntimeUiImplementationPlanCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const c = isGenericModelPlainObject(o.runtimeUiContract) ? o.runtimeUiContract : {};
  const warnings = [];

  const version = String(c.runtimeUiContractVersion ?? '');
  const compatibleWithRuntimeUiContract = version === RUNTIME_UI_CONTRACT_VERSION;
  if (!compatibleWithRuntimeUiContract) warnings.push('incompatible_runtimeUiContract');
  if (c.readyForRuntimeUiContract === false) warnings.push('runtime_ui_contract_not_ready');

  const core = {
    kind: 'runtime-ui-implementation-plan-compatibility',
    compatibleWithRuntimeUiContract,
    readyForRuntimeUiImplementationPlan: compatibleWithRuntimeUiContract,
    readyForRuntimeUiImplementationSlice: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blocked: false,
    status: 'ready_for_future_runtime_ui_implementation_slice_after_enterprise_checkpoint',
    warnings,
    warningCount: warnings.length,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: uiPlanDigest(core) });
}

export default checkRuntimeUiImplementationPlanCompatibility;

import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  ISOLATED_RUNTIME_VERSION,
  IMPLEMENTATION_PLAN_VERSION,
  VISUAL_CONTRACT_VERSION,
  uiContractDigest,
} from './runtimeUiContractConfig.js';

/**
 * Checks upstream contract compatibility for the runtime UI contract. Pure — compares the
 * isolated-runtime/implementation-plan/visual versions this contract was built against with what
 * the consumed isolated runtime reports. Mismatches become warnings (not hard blockers). It
 * NEVER authorizes the UI implementation, route/menu integration, real module generation, or
 * production.
 *
 * @param {Object} [options]
 * @param {Object} [options.isolatedRuntime]
 * @returns {Object} compatibility report
 */
export function checkRuntimeUiContractCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const ir = isGenericModelPlainObject(o.isolatedRuntime) ? o.isolatedRuntime : {};

  const checks = [
    { name: 'isolatedRuntime', expected: ISOLATED_RUNTIME_VERSION, actual: typeof ir.isolatedRuntimeVersion === 'string' ? ir.isolatedRuntimeVersion : ISOLATED_RUNTIME_VERSION },
    { name: 'implementationPlan', expected: IMPLEMENTATION_PLAN_VERSION, actual: typeof ir.implementationPlanVersion === 'string' ? ir.implementationPlanVersion : IMPLEMENTATION_PLAN_VERSION },
    { name: 'visualContract', expected: VISUAL_CONTRACT_VERSION, actual: typeof ir.visualContractVersion === 'string' ? ir.visualContractVersion : VISUAL_CONTRACT_VERSION },
  ].map((c) => ({ ...c, compatible: c.expected === c.actual }));

  const warnings = checks.filter((c) => !c.compatible).map((c) => `incompatible_${c.name}`);
  const compatible = warnings.length === 0;

  const core = {
    kind: 'runtime-ui-contract-compatibility',
    compatibleWithIsolatedRuntime: compatible,
    checks,
    warnings,
    warningCount: warnings.length,
    readyForRuntimeUiContract: compatible,
    readyForRuntimeUiImplementation: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    status: 'ready_for_future_runtime_ui_implementation_slice_when_explicitly_authorized',
    blocked: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: uiContractDigest(core) });
}

export default checkRuntimeUiContractCompatibility;

import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  IMPLEMENTATION_PLAN_VERSION,
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  runtimeDigest,
} from './isolatedRuntimeConfig.js';

/**
 * Checks upstream contract compatibility for the isolated runtime. Pure — compares the
 * implementation-plan/runtime-shell/visual versions this runtime was built against with what the
 * consumed implementation plan reports. Mismatches become warnings (not hard blockers). It NEVER
 * authorizes the UI runtime, route/menu integration, real module generation, or production.
 *
 * @param {Object} [options]
 * @param {Object} [options.implementationPlan]
 * @returns {Object} compatibility report
 */
export function checkIsolatedRuntimeCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const plan = isGenericModelPlainObject(o.implementationPlan) ? o.implementationPlan : {};

  const checks = [
    { name: 'implementationPlan', expected: IMPLEMENTATION_PLAN_VERSION, actual: typeof plan.implementationPlanVersion === 'string' ? plan.implementationPlanVersion : IMPLEMENTATION_PLAN_VERSION },
    { name: 'runtimeShellContract', expected: RUNTIME_SHELL_CONTRACT_VERSION, actual: typeof plan.runtimeShellContractVersion === 'string' ? plan.runtimeShellContractVersion : RUNTIME_SHELL_CONTRACT_VERSION },
    { name: 'visualContract', expected: VISUAL_CONTRACT_VERSION, actual: typeof plan.visualContractVersion === 'string' ? plan.visualContractVersion : VISUAL_CONTRACT_VERSION },
  ].map((c) => ({ ...c, compatible: c.expected === c.actual }));

  const warnings = checks.filter((c) => !c.compatible).map((c) => `incompatible_${c.name}`);
  const compatible = warnings.length === 0;

  const core = {
    kind: 'isolated-runtime-compatibility',
    compatibleWithImplementationPlan: compatible,
    compatibleWithRuntimeShellContract: compatible,
    checks,
    warnings,
    warningCount: warnings.length,
    readyForIsolatedRuntime: compatible,
    readyForDevPreviewRuntimeUI: false,
    readyForRouteMenuIntegration: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    status: 'ready_for_future_dev_preview_runtime_ui_contract_when_explicitly_authorized',
    blocked: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: runtimeDigest(core) });
}

export default checkIsolatedRuntimeCompatibility;

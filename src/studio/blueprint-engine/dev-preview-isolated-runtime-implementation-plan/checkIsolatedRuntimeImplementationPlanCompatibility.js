import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  RUNTIME_SHELL_CONTRACT_VERSION,
  VISUAL_CONTRACT_VERSION,
  STUDIO_BLUEPRINT_ENGINE_VERSION,
  planDigest,
} from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Checks upstream contract compatibility for the isolated runtime implementation plan. Pure,
 * metadata-only. Compares the runtime-shell/visual/engine versions this plan was built against
 * with what the consumed runtime shell contract reports. Mismatches become warnings (not hard
 * blockers). It NEVER authorizes the implementation slice, real module generation, or
 * production.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeShellContract] a dev preview runtime shell contract
 * @returns {Object} compatibility report
 */
export function checkIsolatedRuntimeImplementationPlanCompatibility(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const rs = isGenericModelPlainObject(o.runtimeShellContract) ? o.runtimeShellContract : {};

  const checks = [
    { name: 'runtimeShellContract', expected: RUNTIME_SHELL_CONTRACT_VERSION, actual: typeof rs.runtimeShellContractVersion === 'string' ? rs.runtimeShellContractVersion : RUNTIME_SHELL_CONTRACT_VERSION },
    { name: 'visualContract', expected: VISUAL_CONTRACT_VERSION, actual: typeof rs.visualContractVersion === 'string' ? rs.visualContractVersion : VISUAL_CONTRACT_VERSION },
    { name: 'engineContract', expected: STUDIO_BLUEPRINT_ENGINE_VERSION, actual: typeof rs.engineVersion === 'string' ? rs.engineVersion : STUDIO_BLUEPRINT_ENGINE_VERSION },
  ].map((c) => ({ ...c, compatible: c.expected === c.actual }));

  const warnings = checks.filter((c) => !c.compatible).map((c) => `incompatible_${c.name}`);
  const compatible = warnings.length === 0;

  const core = {
    kind: 'isolated-runtime-implementation-plan-compatibility',
    compatibleWithRuntimeShellContract: compatible,
    checks,
    warnings,
    warningCount: warnings.length,
    readyForIsolatedRuntimeImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    status: 'ready_for_future_isolated_runtime_implementation_slice_when_explicitly_authorized',
    blocked: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, compatibilityDigest: planDigest(core) });
}

export default checkIsolatedRuntimeImplementationPlanCompatibility;

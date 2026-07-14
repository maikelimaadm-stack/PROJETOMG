import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import {
  IMPLEMENTATION_PLAN_NAME,
  IMPLEMENTATION_PLAN_VERSION,
  IMPLEMENTATION_PLAN_MODE,
  IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES,
  planDigest,
} from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Builds a deterministic, safe FALLBACK implementation plan used when the input runtime shell
 * contract is invalid/absent. Pure, metadata-only. It is fully headless: empty plans, blocked
 * readiness, all side-effect capabilities false, `runtimeImplemented: false`. Guarantees the
 * composer never throws.
 *
 * @param {Object} [options]
 * @param {string} [options.reason]
 * @returns {Object} fallback implementation plan
 */
export function createIsolatedRuntimeImplementationPlanFallback(options = {}) {
  const reason = options && typeof options.reason === 'string' ? options.reason : 'invalid_or_missing_runtime_shell_contract';

  const core = {
    kind: 'studio-dev-preview-isolated-runtime-implementation-plan',
    implementationPlanName: IMPLEMENTATION_PLAN_NAME,
    implementationPlanVersion: IMPLEMENTATION_PLAN_VERSION,
    mode: IMPLEMENTATION_PLAN_MODE,
    moduleId: 'plannedModule',
    fallback: true,
    reason,
    readiness: 'blocked',
    readyForIsolatedRuntimeImplementationPlan: false,
    readyForIsolatedRuntimeImplementationSlice: false,
    readyForRealModuleGeneration: false,
    readyForProduction: false,
    blockers: ['isolated_runtime_implementation_plan_fallback_invalid_runtime_shell_contract'],
    warnings: [],
    blockerCount: 1,
    warningCount: 0,
    capabilities: { ...IMPLEMENTATION_PLAN_HEADLESS_CAPABILITIES },
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, implementationPlanDigest: planDigest(core) });
}

export default createIsolatedRuntimeImplementationPlanFallback;

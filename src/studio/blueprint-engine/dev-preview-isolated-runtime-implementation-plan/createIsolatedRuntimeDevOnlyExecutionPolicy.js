import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the DEV-ONLY EXECUTION POLICY. Pure, metadata-only. A future runtime may only run in
 * development, never in production or staging, only after an explicit future slice and a manual
 * gate, and only with the runtime shell + visual contracts present.
 *
 * @param {Object} [options]
 * @returns {Object} dev-only execution policy
 */
export function createIsolatedRuntimeDevOnlyExecutionPolicy(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const core = {
    kind: 'isolated-runtime-dev-only-execution-policy',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    devOnly: true,
    productionAllowed: false,
    stagingAllowed: false,
    requiresExplicitFutureSlice: true,
    requiresManualGate: true,
    requiresRuntimeShellContract: true,
    requiresVisualContract: true,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, executionPolicyDigest: planDigest(core) });
}

export default createIsolatedRuntimeDevOnlyExecutionPolicy;

import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { LIFECYCLE_EXECUTION_STEPS, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the LIFECYCLE EXECUTION plan. Pure, metadata-only. Maps the steps a future runtime
 * WOULD move through (created → preflight → validated → blockedForImplementation →
 * readyForFutureSlice → failedClosed → disposed). No real runtime.
 *
 * @param {Object} [options]
 * @returns {Object} lifecycle execution plan
 */
export function createIsolatedRuntimeLifecycleExecutionPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const steps = LIFECYCLE_EXECUTION_STEPS.map((step, index) => ({
    step,
    order: index,
    terminal: step === 'failedClosed' || step === 'disposed',
    blocking: step === 'blockedForImplementation' || step === 'failedClosed',
    implemented: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'isolated-runtime-lifecycle-execution-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    steps,
    stepIds: [...LIFECYCLE_EXECUTION_STEPS],
    initialStep: 'created',
    blockedStep: 'blockedForImplementation',
    usesRealRuntime: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, lifecycleExecutionDigest: planDigest(core) });
}

export default createIsolatedRuntimeLifecycleExecutionPlan;

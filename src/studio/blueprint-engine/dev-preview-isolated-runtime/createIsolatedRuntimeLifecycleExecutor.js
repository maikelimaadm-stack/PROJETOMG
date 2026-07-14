import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { ISOLATED_RUNTIME_LIFECYCLE_STEPS, runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Executes the isolated runtime LIFECYCLE as a pure sequence of metadata-only transitions
 * (created → preflighted → contractsLoaded → syntheticDataPrepared → framePrepared →
 * blockedForUIRuntime → disposed). No real timers, no event loop, no DOM, no listeners.
 *
 * @param {Object} [options]
 * @returns {Object} lifecycle execution descriptor
 */
export function createIsolatedRuntimeLifecycleExecutor(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const transitions = ISOLATED_RUNTIME_LIFECYCLE_STEPS.map((step, index) => ({
    step,
    order: index,
    terminal: step === 'disposed',
    blocking: step === 'blockedForUIRuntime',
    executed: true, // metadata transition only — no runtime side effect
    metadataOnly: true,
  }));

  const core = {
    kind: 'isolated-runtime-lifecycle-executor',
    moduleId: String(o.implementationPlan?.moduleId ?? 'plannedModule'),
    transitions,
    steps: [...ISOLATED_RUNTIME_LIFECYCLE_STEPS],
    initialStep: 'created',
    finalStep: 'disposed',
    blockedStep: 'blockedForUIRuntime',
    usesTimers: false,
    usesEventLoop: false,
    usesDom: false,
    usesListeners: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, lifecycleDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeLifecycleExecutor;

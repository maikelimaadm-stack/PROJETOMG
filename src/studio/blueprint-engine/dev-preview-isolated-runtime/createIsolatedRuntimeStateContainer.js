import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Builds an ephemeral, in-memory, deterministic, serializable STATE CONTAINER for the isolated
 * runtime. Pure — read-only output; no React state, no hooks, no storage, no persistence. The
 * "state" is a plain metadata snapshot of the current lifecycle step + frame reference.
 *
 * @param {Object} [options]
 * @param {string} [options.step]
 * @param {Object} [options.virtualFrame]
 * @returns {Object} state container
 */
export function createIsolatedRuntimeStateContainer(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const step = typeof o.step === 'string' ? o.step : 'framePrepared';
  const frame = isGenericModelPlainObject(o.virtualFrame) ? o.virtualFrame : {};

  const core = {
    kind: 'isolated-runtime-state-container',
    moduleId: String(frame.moduleId ?? o.implementationPlan?.moduleId ?? 'plannedModule'),
    ephemeral: true,
    inMemoryOnly: true,
    deterministic: true,
    serializable: true,
    readOnlyOutput: true,
    currentStep: step,
    frameState: typeof frame.state === 'string' ? frame.state : 'ready',
    reactState: false,
    hooks: false,
    storage: false,
    persistence: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, stateContainerDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeStateContainer;

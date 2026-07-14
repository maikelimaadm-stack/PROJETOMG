import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { runtimeDigest } from './isolatedRuntimeConfig.js';

/**
 * Executes a render request. Pure. It ALWAYS blocks the real render and instead reports that a
 * virtual frame was produced. `renderAllowed: false`, `realRenderProduced: false`,
 * `virtualFrameProduced: true`. A real UI render requires a future explicit slice.
 *
 * @param {Object} [options]
 * @param {Object} [options.virtualFrame]
 * @returns {Object} render request result
 */
export function createIsolatedRuntimeRenderRequestExecutor(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const frame = isGenericModelPlainObject(o.virtualFrame) ? o.virtualFrame : {};

  const core = {
    kind: 'isolated-runtime-render-request-executor',
    moduleId: String(frame.moduleId ?? o.implementationPlan?.moduleId ?? 'plannedModule'),
    renderAllowed: false,
    virtualFrameProduced: true,
    realRenderProduced: false,
    virtualFrameId: typeof frame.frameId === 'string' ? frame.frameId : null,
    virtualFrameDigest: typeof frame.virtualFrameDigest === 'string' ? frame.virtualFrameDigest : null,
    reason: 'UI runtime requires future explicit slice',
    reactElementProduced: false,
    domProduced: false,
    cssProduced: false,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, renderRequestDigest: runtimeDigest(core) });
}

export default createIsolatedRuntimeRenderRequestExecutor;

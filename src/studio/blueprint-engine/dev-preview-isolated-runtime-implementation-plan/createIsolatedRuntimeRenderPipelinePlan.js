import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { RENDER_PIPELINE_STEPS, planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Declares the RENDER PIPELINE plan. Pure, metadata-only. Describes the ordered steps a future
 * isolated runtime WOULD take (validateContracts → … → blockRealRender → emitDiagnostics). Real
 * render is permanently blocked: `renderImplemented` and `renderAllowed` are `false`.
 *
 * @param {Object} [options]
 * @returns {Object} render pipeline plan
 */
export function createIsolatedRuntimeRenderPipelinePlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};

  const steps = RENDER_PIPELINE_STEPS.map((step, index) => ({
    step,
    order: index,
    implemented: false,
    metadataOnly: true,
  }));

  const core = {
    kind: 'isolated-runtime-render-pipeline-plan',
    moduleId: String(o.runtimeShellContract?.moduleId ?? 'plannedModule'),
    steps,
    stepIds: [...RENDER_PIPELINE_STEPS],
    renderImplemented: false,
    renderAllowed: false,
    reason: 'future isolated runtime implementation slice required',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, renderPipelineDigest: planDigest(core) });
}

export default createIsolatedRuntimeRenderPipelinePlan;

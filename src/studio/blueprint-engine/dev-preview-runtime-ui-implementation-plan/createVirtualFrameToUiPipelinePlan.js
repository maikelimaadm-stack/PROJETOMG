import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { VIRTUAL_FRAME_TO_UI_PIPELINE_STEPS, uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans the virtual-frame-to-UI pipeline. Every step is `planned`; real render is blocked. Pure
 * and deterministic.
 *
 * @returns {Object}
 */
export function createVirtualFrameToUiPipelinePlan() {
  const steps = VIRTUAL_FRAME_TO_UI_PIPELINE_STEPS.map((step) => ({
    step,
    status: 'planned',
    implemented: false,
    producesRealRender: false,
  }));
  const core = {
    kind: 'virtual-frame-to-ui-pipeline-plan',
    steps,
    stepCount: steps.length,
    pipelineImplemented: false,
    realRenderAllowed: false,
    reason: 'future explicit runtime UI implementation slice required',
  };
  return safeCloneGenericModel({ ...core, pipelinePlanDigest: uiPlanDigest(core) });
}

export default createVirtualFrameToUiPipelinePlan;

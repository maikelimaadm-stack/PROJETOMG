import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans a renderer adapter as metadata only. No real renderer is created. Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiRendererAdapterPlan() {
  const core = {
    kind: 'runtime-ui-renderer-adapter-plan',
    rendererAdapterKind: 'planned_metadata_only',
    rendererImplemented: false,
    reactRenderer: false,
    domRenderer: false,
    cssRenderer: false,
    routeRenderer: false,
    menuRenderer: false,
    moduleRenderer: false,
    producesRealRender: false,
  };
  return safeCloneGenericModel({ ...core, rendererAdapterPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiRendererAdapterPlan;

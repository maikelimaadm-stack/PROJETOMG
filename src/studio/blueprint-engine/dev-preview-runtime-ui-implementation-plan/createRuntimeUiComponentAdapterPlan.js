import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans a component adapter as metadata only. No real component / import / path. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRuntimeUiComponentAdapterPlan() {
  const core = {
    kind: 'runtime-ui-component-adapter-plan',
    componentAdapterKind: 'planned_metadata_only',
    componentAdapterImplemented: false,
    realComponentImports: false,
    realComponentPath: null,
    jsx: false,
    tsx: false,
    dom: false,
  };
  return safeCloneGenericModel({ ...core, componentAdapterPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiComponentAdapterPlan;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans a state adapter as metadata only. No react state, hooks, storage, persistence or DOM.
 * Pure and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiStateAdapterPlan() {
  const core = {
    kind: 'runtime-ui-state-adapter-plan',
    stateAdapterKind: 'planned_metadata_only',
    stateAdapterImplemented: false,
    reactState: false,
    hooks: false,
    storage: false,
    persistence: false,
    cssRuntime: false,
    stylesheetCreated: false,
    domAttributesSet: false,
    realAriaSet: false,
  };
  return safeCloneGenericModel({ ...core, stateAdapterPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiStateAdapterPlan;

import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans an interaction adapter as metadata only. No handlers, no mutation, no navigation. Pure
 * and deterministic.
 * @returns {Object}
 */
export function createRuntimeUiInteractionAdapterPlan() {
  const core = {
    kind: 'runtime-ui-interaction-adapter-plan',
    interactionAdapterKind: 'planned_metadata_only',
    interactionAdapterImplemented: false,
    handlersCreated: false,
    mutationAllowed: false,
    navigationAllowed: false,
    submitAllowed: false,
    saveAllowed: false,
    requiresFutureRuntimeImplementation: true,
  };
  return safeCloneGenericModel({ ...core, interactionAdapterPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiInteractionAdapterPlan;

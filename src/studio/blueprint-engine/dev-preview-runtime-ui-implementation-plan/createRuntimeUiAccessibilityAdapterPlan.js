import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { uiPlanDigest } from './runtimeUiImplementationPlanConfig.js';

/**
 * Plans an accessibility adapter as metadata only. No DOM attributes, no real ARIA set. Pure and
 * deterministic.
 * @returns {Object}
 */
export function createRuntimeUiAccessibilityAdapterPlan() {
  const core = {
    kind: 'runtime-ui-accessibility-adapter-plan',
    accessibilityAdapterKind: 'planned_metadata_only',
    accessibilityAdapterImplemented: false,
    labelsPlanned: true,
    keyboardPlanned: true,
    focusOrderPlanned: true,
    reactState: false,
    hooks: false,
    storage: false,
    persistence: false,
    cssRuntime: false,
    stylesheetCreated: false,
    domAttributesSet: false,
    realAriaSet: false,
  };
  return safeCloneGenericModel({ ...core, accessibilityAdapterPlanDigest: uiPlanDigest(core) });
}

export default createRuntimeUiAccessibilityAdapterPlan;

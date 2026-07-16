import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { PREVIEW_SANDBOX_CONTRACT_VERSION, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Synthetic preview handoff PLAN — plans a future validated-draft handoff to the synthetic Preview
 * Sandbox only. No preview payload/mount/real-data/UI in this slice. Metadata only.
 * @returns {Object}
 */
export function createSyntheticPreviewHandoffPlan() {
  const core = {
    kind: 'authoring-synthetic-preview-handoff-plan',
    previewHandoffPlanned: true,
    previewHandoffImplemented: false,
    handoffKind: 'synthetic_preview_candidate',
    targetSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    compatibleWithPreviewSandbox: true,
    previewPayloadCreated: false,
    previewMounted: false,
    realDataAttached: false,
    handoffToProduct: false,
    requiresValidatedDraft: true,
  };
  return safeCloneGenericModel({ ...core, syntheticPreviewHandoffPlanDigest: authoringPlanDigest(core) });
}

export default createSyntheticPreviewHandoffPlan;

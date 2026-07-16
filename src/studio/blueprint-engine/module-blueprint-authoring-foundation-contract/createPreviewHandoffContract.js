import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { PREVIEW_SANDBOX_CONTRACT_VERSION, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * The PREVIEW HANDOFF CONTRACT — describes how a validated authoring draft would hand off to the
 * SYNTHETIC Preview Sandbox destination. Metadata only. The handoff target is the synthetic sandbox
 * ONLY (never the product); no preview payload is created here, nothing is mounted, no route/menu is
 * created, and no real data is attached. Pure and deterministic.
 *
 * @returns {Object}
 */
export function createPreviewHandoffContract() {
  const core = {
    kind: 'authoring-preview-handoff-contract',
    handoffKind: 'synthetic_preview_candidate',
    handoffTarget: 'synthetic-preview-sandbox',
    targetSandboxVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    compatibleWithPreviewSandbox: true,
    syntheticOnly: true,
    carriesDraftSnapshot: true,
    draftSnapshotCanonical: false,
    previewPayloadCreated: false,
    previewMounted: false,
    realDataAttached: false,
    handoffToProduct: false,
    mountsPreview: false,
    routeCreated: false,
    menuCreated: false,
    realDataRead: false,
    realDataWrite: false,
    persisted: false,
    requiresValidatedDraft: true,
    reversibleByNonConsumption: true,
  };
  return safeCloneGenericModel({ ...core, previewHandoffDigest: authoringFoundationDigest(core) });
}

export default createPreviewHandoffContract;

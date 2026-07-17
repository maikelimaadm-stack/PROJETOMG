import { PREVIEW_SANDBOX_CONTRACT_VERSION, TARGET_SANDBOX_KIND, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the TARGET Module Preview Sandbox descriptor contract — the metadata shape the future bridge
 * would produce for the synthetic sandbox. Metadata only, synthetic-only; no real payload, no mount,
 * no route/menu, no product exposure, no module, no persistence. @returns {Object}
 */
export function createTargetPreviewSandboxContract() {
  const core = {
    kind: 'bridge-target-preview-sandbox-contract',
    targetKind: TARGET_SANDBOX_KIND,
    targetContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    syntheticOnly: true,
    metadataOnly: true,
    previewMounted: false,
    routeCreated: false,
    menuCreated: false,
    productExposed: false,
    realDataAttached: false,
    moduleGenerated: false,
    persistenceAllowed: false,
    realPayloadCreated: false,
    targetContractConsumedReadOnly: true,
  };
  return safeCloneGenericModel({ ...core, targetPreviewSandboxContractDigest: bridgeDigest(core) });
}

export default createTargetPreviewSandboxContract;

import { TARGET_SANDBOX_KIND, PREVIEW_SANDBOX_CONTRACT_VERSION } from './bridgeRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeBridgeInput.js';

/**
 * Builds the SYNTHETIC `module_preview_sandbox_candidate` target descriptor from the mapped fields. Metadata
 * only: no mount, no route/menu, no product exposure, no module, no persistence, no real data. Adds only the
 * contract-declared target fields (from `mapped`). Deep-frozen, serializable, deterministic. It never mounts
 * a preview, never creates a component tree, never touches the Preview Sandbox. Pure. @param {Object} options
 * @returns {Object}
 */
export function createTargetPreviewSandboxDescriptor(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const mapped = isPlainObject(o.mapped) ? o.mapped : {};
  const core = {
    kind: 'bridge-target-preview-sandbox-descriptor',
    targetKind: TARGET_SANDBOX_KIND,
    targetContractVersion: PREVIEW_SANDBOX_CONTRACT_VERSION,
    synthetic: true,
    metadataOnly: true,
    immutable: true,
    validated: true,
    previewMounted: false,
    routeCreated: false,
    menuCreated: false,
    productExposed: false,
    realDataAttached: false,
    moduleGenerated: false,
    persistenceAllowed: false,
    // Contract-declared mapped fields only.
    ...mapped,
  };
  return deepFreeze(core);
}

export default createTargetPreviewSandboxDescriptor;

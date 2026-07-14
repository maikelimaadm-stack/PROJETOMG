import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { shellDigest } from './devPreviewRuntimeShellContractConfig.js';

/**
 * Emits navigation PLACEMENT-runtime plan metadata for the future shell — entirely as a
 * blocked plan. Pure, metadata-only. Adds NO menu entry, wires NO navigation, touches NO App.
 * Consuming this changes nothing in the running app.
 *
 * @param {Object} [options]
 * @returns {Object} placement blocked metadata
 */
export function createDevPreviewRuntimeShellPlacementBlockedMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.visualContract?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-runtime-shell-placement-blocked-metadata',
    moduleId,
    futurePlacementRuntime: { group: 'Studio (runtime preview)', label: moduleId },
    menuCreated: false,
    navMounted: false,
    appTouched: false,
    navigationTouched: false,
    exposedInApp: false,
    blockedNow: true,
    reason: 'requires future approved runtime implementation slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, placementBlockedDigest: shellDigest(core) });
}

export default createDevPreviewRuntimeShellPlacementBlockedMetadata;

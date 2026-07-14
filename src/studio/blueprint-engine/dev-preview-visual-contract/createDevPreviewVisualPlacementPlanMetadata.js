import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { visualDigest } from './devPreviewVisualContractConfig.js';

/**
 * Emits navigation PLACEMENT plan metadata for the future visual preview — entirely as a
 * blocked plan. Pure, metadata-only. Adds NO menu entry, wires NO navigation, touches NO App.
 * Consuming this changes nothing in the running app.
 *
 * @param {Object} [options]
 * @param {Object} [options.bridge] a dev preview contract bridge
 * @returns {Object} placement plan metadata (blocked)
 */
export function createDevPreviewVisualPlacementPlanMetadata(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.bridge?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'dev-preview-visual-placement-plan-metadata',
    moduleId,
    futurePlacementPlan: { group: 'Studio (visual preview)', label: moduleId },
    menuCreated: false,
    navMounted: false,
    appTouched: false,
    navigationTouched: false,
    exposedInApp: false,
    blockedNow: true,
    reason: 'requires future approved dev preview runtime slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, placementPlanDigest: visualDigest(core) });
}

export default createDevPreviewVisualPlacementPlanMetadata;

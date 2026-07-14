import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { planDigest } from './isolatedRuntimeImplementationPlanConfig.js';

/**
 * Emits navigation PLACEMENT-runtime plan metadata for the future isolated runtime — entirely as
 * a blocked plan. Pure, metadata-only. Adds NO menu entry, wires NO navigation, touches NO App.
 *
 * @param {Object} [options]
 * @returns {Object} placement blocked plan
 */
export function createIsolatedRuntimePlacementBlockedPlan(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = String(o.runtimeShellContract?.moduleId ?? 'plannedModule');

  const core = {
    kind: 'isolated-runtime-placement-blocked-plan',
    moduleId,
    futurePlacementRuntime: { group: 'Studio (isolated runtime preview)', label: moduleId },
    menuCreated: false,
    navMounted: false,
    appTouched: false,
    navigationTouched: false,
    exposedInApp: false,
    blockedNow: true,
    reason: 'requires future approved isolated runtime implementation slice',
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, placementBlockedDigest: planDigest(core) });
}

export default createIsolatedRuntimePlacementBlockedPlan;

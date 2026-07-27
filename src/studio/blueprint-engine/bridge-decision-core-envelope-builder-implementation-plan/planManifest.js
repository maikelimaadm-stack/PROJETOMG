import { PLAN_NAME, PLAN_VERSION, PLAN_MODE } from './planConfig.js';
import { createPlanDigest } from './createPlanDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';
/** Deterministic manifest: per-part digests + overall. Pure; frozen. FNV internal identity, not crypto. */
export function createPlanManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const parts = isPlainObject(o.parts) ? o.parts : {};
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createPlanDigest(parts[k]);
  const overallDigest = createPlanDigest({ partDigests });
  return deepFreeze({
    kind: 'builder-implementation-plan-manifest',
    planName: PLAN_NAME, planVersion: PLAN_VERSION, mode: PLAN_MODE,
    partCount: Object.keys(partDigests).length, partDigests, overallDigest,
    planOnly: true, cryptographicIntegrityProvided: false,
  });
}
export default createPlanManifest;

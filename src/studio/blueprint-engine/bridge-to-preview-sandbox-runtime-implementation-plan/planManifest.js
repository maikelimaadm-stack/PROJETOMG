import { PLAN_NAME, PLAN_VERSION, PLAN_MODE } from './planConfig.js';
import { createPlanDigest } from './createPlanDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './planInput.js';

/**
 * Deterministic PLAN manifest: per-part digests + an overall digest over all parts. Pure; frozen. The digest is
 * an internal identity function (FNV-1a), NOT cryptographic. Same plan graph -> same digest.
 * @param {Object} options @param {Object} options.parts @returns {Object}
 */
export function createPlanManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const parts = isPlainObject(o.parts) ? o.parts : {};
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createPlanDigest(parts[k]);
  const overallDigest = createPlanDigest({ partDigests });
  return deepFreeze({
    kind: 'bridge-to-preview-sandbox-runtime-implementation-plan-manifest',
    planName: PLAN_NAME,
    planVersion: PLAN_VERSION,
    mode: PLAN_MODE,
    partCount: Object.keys(partDigests).length,
    partDigests,
    overallDigest,
    planOnly: true,
    cryptographicIntegrityProvided: false,
  });
}

export default createPlanManifest;

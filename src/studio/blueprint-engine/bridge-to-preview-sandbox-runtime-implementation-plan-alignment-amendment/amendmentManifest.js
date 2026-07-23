import { AMENDMENT_NAME, AMENDMENT_VERSION, AMENDMENT_MODE } from './amendmentConfig.js';
import { createAmendmentDigest } from './createAmendmentDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './amendmentInput.js';
/** Deterministic manifest: per-part digests + overall. Pure; frozen. FNV internal identity, not crypto. */
export function createAmendmentManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const parts = isPlainObject(o.parts) ? o.parts : {};
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createAmendmentDigest(parts[k]);
  const overallDigest = createAmendmentDigest({ partDigests });
  return deepFreeze({
    kind: 'amendment-manifest',
    amendmentName: AMENDMENT_NAME, amendmentVersion: AMENDMENT_VERSION, mode: AMENDMENT_MODE,
    partCount: Object.keys(partDigests).length, partDigests, overallDigest,
    amendmentOnly: true, cryptographicIntegrityProvided: false,
  });
}
export default createAmendmentManifest;

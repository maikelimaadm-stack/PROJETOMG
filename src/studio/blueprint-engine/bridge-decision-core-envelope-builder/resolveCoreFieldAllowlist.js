import { CORE_ALLOWLIST, DIGEST_FIELD, SOURCE_FIELDS } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Resolves the exact core-field allowlist from the real upstream (DECISION_DIGEST_PREIMAGE_FIELDS). No local fallback
 * or divergent copy. Returns a frozen array; the invariant `allowlist === sourceFields \ digestField` is guaranteed
 * by the upstream capture.
 */
export function resolveCoreFieldAllowlist() {
  return deepFreeze([...CORE_ALLOWLIST]);
}
/** True iff the allowlist equals the real source fields minus the digest field (structural self-check). */
export function coreAllowlistIsSourceMinusDigest() {
  const expected = SOURCE_FIELDS.filter((f) => f !== DIGEST_FIELD).sort();
  return JSON.stringify([...CORE_ALLOWLIST].sort()) === JSON.stringify(expected);
}
export default resolveCoreFieldAllowlist;

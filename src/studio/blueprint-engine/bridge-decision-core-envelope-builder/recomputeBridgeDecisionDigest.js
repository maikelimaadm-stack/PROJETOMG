import { createDeterministicDigest, stableSerialize } from '../module-blueprint-authoring-runtime/index.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'digest_recompute_validation';
/**
 * Recomputes the digest over the extracted core using the REAL deterministic helper and compares it EXACTLY with the
 * source's bridgeDecisionDigest. Internal-identity only (FNV-1a, key-sorted) — NOT cryptographic. No synthesis,
 * alias or fallback. Returns { ok, recomputed, issues }.
 */
export function recomputeBridgeDecisionDigest(core, sourceDigest) {
  const recomputed = createDeterministicDigest(core);
  const issues = [];
  if (typeof recomputed !== 'string' || recomputed !== sourceDigest) issues.push(makeIssue('BUILDER_DIGEST_MISMATCH', STAGE));
  return { ok: issues.length === 0, recomputed, issues, serialized: stableSerialize(core) };
}
export default recomputeBridgeDecisionDigest;

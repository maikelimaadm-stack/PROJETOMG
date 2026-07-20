import { stableSerialize, createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
import { REAL_HANDOFF_FIELDS } from './bridgeRuntimeConfig.js';
import { createBridgeIssue } from './createBridgeIssue.js';
import { isNonEmptyString } from './normalizeBridgeInput.js';

/**
 * Recomputes the handoff digest READ-ONLY using the Authoring Runtime's own `stableSerialize` +
 * `createDeterministicDigest` (NO alternative serializer) and compares to `handoffDigest`. The preimage is
 * every real handoff field EXCEPT `handoffDigest`. FNV-1a is an internal identity only. Fails closed on a
 * missing or mismatched digest. Pure — never mutates the handoff. @param {Object} handoff @returns {Object}
 */
export function recomputeAndValidateHandoffDigest(handoff) {
  const src = handoff && typeof handoff === 'object' ? handoff : {};
  const issues = [];
  const provided = src.handoffDigest;
  if (!isNonEmptyString(provided)) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_HANDOFF_DIGEST_REQUIRED', severity: 'blocker', stage: 'source_digest_validation', path: 'source.handoffDigest', message: 'handoffDigest is required and must be a non-empty string.' }));
    return { ok: false, recomputed: null, provided: null, issues };
  }
  // Preimage: real handoff fields minus handoffDigest (matches the runtime's handoff `core`).
  /** @type {Record<string, unknown>} */
  const preimage = {};
  for (const f of REAL_HANDOFF_FIELDS) {
    if (f === 'handoffDigest') continue;
    if (Object.prototype.hasOwnProperty.call(src, f)) preimage[f] = src[f];
  }
  const recomputed = createDeterministicDigest(preimage);
  const match = recomputed === provided;
  if (!match) {
    issues.push(createBridgeIssue({ issueCode: 'BRIDGE_SOURCE_HANDOFF_DIGEST_MISMATCH', severity: 'blocker', stage: 'source_digest_validation', path: 'source.handoffDigest', message: 'Recomputed handoffDigest does not match the provided handoffDigest (recompute_and_compare).' }));
  }
  return { ok: match, recomputed, provided, serializedPreimageLength: stableSerialize(preimage).length, issues };
}

export default recomputeAndValidateHandoffDigest;

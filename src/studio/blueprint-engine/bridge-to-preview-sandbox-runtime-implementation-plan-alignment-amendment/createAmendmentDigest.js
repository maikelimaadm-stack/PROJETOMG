import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
/**
 * Deterministic AMENDMENT digest — READ-ONLY reuse of the Authoring Runtime helper (FNV-1a, key-sorted). Same
 * graph -> same digest. Internal identity only, NOT cryptographic. @param {any} v @returns {string}
 */
export function createAmendmentDigest(v) { return createDeterministicDigest(v ?? null); }
export default createAmendmentDigest;

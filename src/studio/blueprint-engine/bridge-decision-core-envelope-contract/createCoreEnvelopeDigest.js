import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
/**
 * Deterministic digest — READ-ONLY reuse of the Authoring Runtime helper (FNV-1a, key-sorted). Same graph ->
 * same digest. Declared INTERNAL-IDENTITY-ONLY, NOT cryptographic. Same helper the real bridge uses to produce
 * bridgeDecisionDigest, so the contract's recompute-and-compare is exact. @param {any} v @returns {string}
 */
export function createCoreEnvelopeDigest(v) { return createDeterministicDigest(v ?? null); }
export default createCoreEnvelopeDigest;

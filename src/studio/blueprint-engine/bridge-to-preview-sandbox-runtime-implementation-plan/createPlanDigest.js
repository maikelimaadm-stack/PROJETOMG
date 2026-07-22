import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
/**
 * Deterministic PLAN digest — READ-ONLY reuse of the Authoring Runtime helper (FNV-1a, key-sorted). Same graph
 * -> same digest. Declared INTERNAL-IDENTITY-ONLY, NOT cryptographic. Pure. This is a plan-manifest identity
 * helper, NOT the future consumer decision digest (which is planned-only and NOT implemented here).
 * @param {any} v @returns {string}
 */
export function createPlanDigest(v) { return createDeterministicDigest(v ?? null); }
export default createPlanDigest;

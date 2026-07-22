import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
/**
 * Deterministic contract digest, READ-ONLY reuse of the Authoring Runtime helper (FNV-1a, key-sorted). Same
 * graph -> same digest. NOT cryptographic. Pure. @param {any} v @returns {string}
 */
export function createContractDigest(v) { return createDeterministicDigest(v ?? null); }
export default createContractDigest;

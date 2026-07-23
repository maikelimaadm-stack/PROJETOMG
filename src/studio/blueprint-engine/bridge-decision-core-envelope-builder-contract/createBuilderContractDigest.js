import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
/**
 * Deterministic digest — READ-ONLY reuse of the Authoring Runtime helper (FNV-1a, key-sorted). Internal identity
 * only, NOT cryptographic. Same helper the real bridge uses. @param {any} v @returns {string}
 */
export function createBuilderContractDigest(v) { return createDeterministicDigest(v ?? null); }
export default createBuilderContractDigest;

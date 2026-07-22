import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
/** Deterministic contract digest, READ-ONLY reuse of the runtime helper (FNV-1a). NOT cryptographic. @param {any} v @returns {string} */
export function createEnvelopeDigest(v) { return createDeterministicDigest(v ?? null); }
export default createEnvelopeDigest;

import { stableSerialize } from './stableSerialize.js';

/**
 * Deterministic digest (FNV-1a -> 8-hex) over a KEY-SORTED serialization. Same value graph -> same
 * digest, regardless of key order. Not cryptographic. No clock, no randomness, no I/O. `Math.imul` is
 * used only for the fixed FNV prime multiply — it is not a random source.
 *
 * @param {unknown} value
 * @returns {string} e.g. "fnv1a-1b5c8a8a"
 */
export function createDeterministicDigest(value) {
  const json = stableSerialize(value ?? null);
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i += 1) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a-${hash.toString(16).padStart(8, '0')}`;
}

export default createDeterministicDigest;

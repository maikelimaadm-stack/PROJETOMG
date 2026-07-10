/**
 * Deterministic, dependency-free checksum (FNV-1a → 8-hex) for the Generic Model
 * Runtime. Stable across runs for the same canonical JSON. Not cryptographic —
 * a lightweight integrity hash. Functions/undefined are dropped by JSON.
 *
 * @param {Object} [options]
 * @param {unknown} [options.value]
 * @returns {string} e.g. "fnv1a-1b5c8a8a"
 */
export function createGenericModelChecksum(options = {}) {
  const value = options && typeof options === 'object' ? options.value : options;
  let json;
  try {
    json = JSON.stringify(value ?? null);
  } catch {
    json = 'null';
  }
  let hash = 0x811c9dc5;
  for (let i = 0; i < json.length; i += 1) {
    hash ^= json.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193) >>> 0;
  }
  return `fnv1a-${hash.toString(16).padStart(8, '0')}`;
}

export default createGenericModelChecksum;

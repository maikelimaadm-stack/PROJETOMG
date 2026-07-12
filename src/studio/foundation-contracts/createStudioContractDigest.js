import { createGenericModelChecksum } from '../../runtime/generic-model/index.js';

/**
 * Deterministic contract digest (FNV-1a via the runtime helper). Same input → same
 * digest; order/safety/route/menu/persistence/permission changes change the digest;
 * no secret enters the digest; input is never mutated.
 *
 * @param {Object} [options]
 * @param {unknown} [options.value]
 * @returns {string} e.g. "fnv1a-1b5c8a8a"
 */
export function createStudioContractDigest(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  return createGenericModelChecksum({ value: o.value ?? null });
}

export default createStudioContractDigest;

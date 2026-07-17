import { bridgeDigest } from './bridgeContractConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Builds a deterministic manifest of the bridge-contract parts. For each part it records the part's own
 * digest field (falling back to a freshly computed digest) plus a manifest-level digest over the whole
 * part map. Pure — no I/O, no mutation, no side effects. Same parts -> same manifest + digest.
 * @param {Object} [options] @param {Object} [options.parts] @returns {Object}
 */
export function createBridgeManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  /** @type {Record<string, string>} */
  const partDigests = {};
  const partNames = Object.keys(parts).sort();
  for (const name of partNames) {
    const part = parts[name];
    partDigests[name] = partDigestOf(part);
  }

  const core = {
    kind: 'bridge-contract-manifest',
    partNames,
    partCount: partNames.length,
    partDigests,
    deterministic: true,
    metadataOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: bridgeDigest(core) });
}

/** @param {unknown} part @returns {string} */
function partDigestOf(part) {
  if (isGenericModelPlainObject(part)) {
    for (const k of Object.keys(part)) {
      if (k.endsWith('Digest') && typeof part[k] === 'string' && part[k].length > 0) return part[k];
    }
  }
  return bridgeDigest(part ?? null);
}

export default createBridgeManifest;

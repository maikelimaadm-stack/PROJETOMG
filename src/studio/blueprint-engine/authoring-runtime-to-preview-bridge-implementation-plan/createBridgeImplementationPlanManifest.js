import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Builds a deterministic manifest of the bridge-implementation-plan parts. For each part it records the
 * part's own digest field (falling back to a freshly computed digest) plus a manifest-level digest over
 * the whole part map. Pure — no I/O, no mutation. Same parts -> same manifest + digest.
 * @param {Object} [options] @returns {Object}
 */
export function createBridgeImplementationPlanManifest(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const parts = isGenericModelPlainObject(o.parts) ? o.parts : {};

  /** @type {Record<string, string>} */
  const partDigests = {};
  const partNames = Object.keys(parts).sort();
  for (const name of partNames) partDigests[name] = partDigestOf(parts[name]);

  const core = {
    kind: 'bridge-implementation-plan-manifest',
    partNames,
    partCount: partNames.length,
    partDigests,
    deterministic: true,
    metadataOnly: true,
    planOnly: true,
  };
  return safeCloneGenericModel({ ...core, manifestDigest: bridgePlanDigest(core) });
}

/** @param {unknown} part @returns {string} */
function partDigestOf(part) {
  if (isGenericModelPlainObject(part)) {
    for (const k of Object.keys(part)) {
      if (k.endsWith('Digest') && typeof part[k] === 'string' && part[k].length > 0) return part[k];
    }
  }
  return bridgePlanDigest(part ?? null);
}

export default createBridgeImplementationPlanManifest;

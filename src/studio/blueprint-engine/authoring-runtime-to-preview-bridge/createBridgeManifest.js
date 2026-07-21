import { createDeterministicDigest } from '../module-blueprint-authoring-runtime/index.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Builds a deterministic manifest of the bridge parts. For each part records a deterministic digest; adds a
 * manifest-level digest over the whole part map. Pure. @param {Object} options @returns {Object}
 */
export function createBridgeManifest(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const parts = o.parts && typeof o.parts === 'object' ? o.parts : {};
  const partNames = Object.keys(parts).sort();
  const partDigests = {};
  for (const name of partNames) partDigests[name] = createDeterministicDigest(parts[name] ?? null);
  const core = {
    kind: 'bridge-manifest',
    partNames,
    partCount: partNames.length,
    partDigests,
    deterministic: true,
    metadataOnly: true,
  };
  return deepFreeze({ ...core, manifestDigest: createDeterministicDigest(core), overallDigest: createDeterministicDigest(core) });
}

export default createBridgeManifest;

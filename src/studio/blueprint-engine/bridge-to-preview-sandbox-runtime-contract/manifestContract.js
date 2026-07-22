import { CONTRACT_NAME, CONTRACT_VERSION, CONTRACT_MODE } from './contractRuntimeConfig.js';
import { createContractDigest } from './createContractDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeContractInput.js';

/**
 * Deterministic contract manifest: per-part digests + an overall digest over all parts. Pure; deep-frozen.
 * @param {Object} options @param {Object} options.parts @returns {Object}
 */
export function createContractManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const parts = isPlainObject(o.parts) ? o.parts : {};
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createContractDigest(parts[k]);
  const overallDigest = createContractDigest({ partDigests });
  return deepFreeze({
    kind: 'bridge-to-sandbox-contract-manifest',
    contractName: CONTRACT_NAME,
    contractVersion: CONTRACT_VERSION,
    mode: CONTRACT_MODE,
    partCount: Object.keys(partDigests).length,
    partDigests,
    overallDigest,
    contractOnly: true,
  });
}

export default createContractManifest;

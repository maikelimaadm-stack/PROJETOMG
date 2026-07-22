import { ENVELOPE_CONTRACT_NAME, ENVELOPE_CONTRACT_VERSION, ENVELOPE_CONTRACT_MODE } from './envelopeContractConfig.js';
import { createEnvelopeDigest } from './createEnvelopeDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeEnvelopeInput.js';

/**
 * Deterministic envelope-contract manifest: per-part digests + an overall digest over all parts. Pure; frozen.
 * @param {Object} options @param {Object} options.parts @returns {Object}
 */
export function createEnvelopeManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const parts = isPlainObject(o.parts) ? o.parts : {};
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createEnvelopeDigest(parts[k]);
  const overallDigest = createEnvelopeDigest({ partDigests });
  return deepFreeze({
    kind: 'envelope-contract-manifest',
    contractName: ENVELOPE_CONTRACT_NAME,
    contractVersion: ENVELOPE_CONTRACT_VERSION,
    mode: ENVELOPE_CONTRACT_MODE,
    partCount: Object.keys(partDigests).length,
    partDigests,
    overallDigest,
    contractOnly: true,
  });
}

export default createEnvelopeManifest;

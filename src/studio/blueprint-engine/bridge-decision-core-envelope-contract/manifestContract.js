import { CORE_ENVELOPE_CONTRACT_NAME, CORE_ENVELOPE_CONTRACT_VERSION, CORE_ENVELOPE_CONTRACT_MODE } from './coreEnvelopeConfig.js';
import { createCoreEnvelopeDigest } from './createCoreEnvelopeDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './normalizeCoreEnvelopeInput.js';
/** Deterministic manifest: per-part digests + overall digest. Pure; frozen. FNV internal identity, not crypto. */
export function createCoreEnvelopeManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const parts = isPlainObject(o.parts) ? o.parts : {};
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createCoreEnvelopeDigest(parts[k]);
  const overallDigest = createCoreEnvelopeDigest({ partDigests });
  return deepFreeze({
    kind: 'core-envelope-contract-manifest',
    contractName: CORE_ENVELOPE_CONTRACT_NAME, contractVersion: CORE_ENVELOPE_CONTRACT_VERSION, mode: CORE_ENVELOPE_CONTRACT_MODE,
    partCount: Object.keys(partDigests).length, partDigests, overallDigest,
    contractOnly: true, cryptographicIntegrityProvided: false,
  });
}
export default createCoreEnvelopeManifest;

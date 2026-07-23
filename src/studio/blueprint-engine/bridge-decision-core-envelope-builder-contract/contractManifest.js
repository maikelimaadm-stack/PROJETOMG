import { BUILDER_CONTRACT_NAME, BUILDER_CONTRACT_VERSION, BUILDER_CONTRACT_MODE } from './contractConfig.js';
import { createBuilderContractDigest } from './createBuilderContractDigest.js';
import { deepFreeze } from './deepFreeze.js';
import { isPlainObject } from './builderInput.js';
/** Deterministic manifest: per-part digests + overall. Pure; frozen. FNV internal identity, not crypto. */
export function createBuilderContractManifest(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const parts = isPlainObject(o.parts) ? o.parts : {};
  const partDigests = {};
  for (const k of Object.keys(parts).sort()) partDigests[k] = createBuilderContractDigest(parts[k]);
  const overallDigest = createBuilderContractDigest({ partDigests });
  return deepFreeze({
    kind: 'builder-contract-manifest',
    contractName: BUILDER_CONTRACT_NAME, contractVersion: BUILDER_CONTRACT_VERSION, mode: BUILDER_CONTRACT_MODE,
    partCount: Object.keys(partDigests).length, partDigests, overallDigest,
    contractOnly: true, cryptographicIntegrityProvided: false,
  });
}
export default createBuilderContractManifest;

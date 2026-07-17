import { bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the DIGEST SEMANTICS contract. FNV-1a is a deterministic INTERNAL identity only — NOT a
 * cryptographic, authenticity, tamper-proof or certification signal, and may authorize NOTHING real. A
 * cryptographic digest is required before certification/production. Metadata only. @returns {Object}
 */
export function createBridgeDigestSemanticsContract() {
  const core = {
    kind: 'bridge-digest-semantics-contract',
    sourceDigestAlgorithm: 'fnv1a-32',
    sourceDigestPurpose: 'deterministic_internal_identity',
    cryptographicIntegrityProvided: false,
    authenticityProvided: false,
    tamperProofProvided: false,
    certificationIntegrityProvided: false,
    digestMayAuthorizeCertification: false,
    digestMayAuthorizeModuleGeneration: false,
    digestMayAuthorizeProduction: false,
    cryptographicDigestRequiredBeforeCertification: true,
    cryptographicDigestRequiredBeforeProduction: true,
    fnv1aInternalOnly: true,
  };
  return safeCloneGenericModel({ ...core, digestSemanticsContractDigest: bridgeDigest(core) });
}

export default createBridgeDigestSemanticsContract;

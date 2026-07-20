import { REAL_HANDOFF_FIELDS, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the DIGEST SEMANTICS contract, aligned to the REAL handoff. The real handoff digest field is
 * `handoffDigest` (NOT a generic `digest`), computed by the runtime's `createDeterministicDigest` (FNV-1a
 * -> 8 hex) over the runtime's `stableSerialize` (key-sorted) of the handoff `core` — i.e. every handoff
 * field EXCEPT `handoffDigest` itself. Validation mode is `recompute_and_compare`: recompute the digest
 * over the handoff-minus-handoffDigest and compare to `handoffDigest`. The future bridge MUST reuse the
 * runtime serializer/digest read-only — no alternative serializer. FNV-1a is a deterministic INTERNAL
 * identity only — NOT cryptographic/authenticity/tamper-proof, and may authorize NOTHING real. A
 * cryptographic digest is required before certification/production. Metadata only. @returns {Object}
 */
export function createBridgeDigestSemanticsContract() {
  const preimageFields = REAL_HANDOFF_FIELDS.filter((f) => f !== 'handoffDigest');
  const core = {
    kind: 'bridge-digest-semantics-contract',
    sourceDigestField: 'handoffDigest',
    genericDigestSourceFieldAllowed: false,
    digestValidationMode: 'recompute_and_compare',
    sourceDigestAlgorithm: 'fnv1a-32',
    sourceDigestPurpose: 'deterministic_internal_identity',
    // Canonical serializer + digest helper (runtime, reused read-only).
    canonicalSerializer: 'stableSerialize',
    canonicalSerializerPath: 'src/studio/blueprint-engine/module-blueprint-authoring-runtime/stableSerialize.js',
    digestHelper: 'createDeterministicDigest',
    digestHelperPath: 'src/studio/blueprint-engine/module-blueprint-authoring-runtime/createDeterministicDigest.js',
    digestHelperReusedReadOnly: true,
    alternativeSerializerAllowed: false,
    // Preimage: the handoff `core` = all real handoff fields except handoffDigest itself.
    preimageFields,
    preimageFieldCount: preimageFields.length,
    handoffDigestExcludedFromOwnPreimage: true,
    canonicalizationKeySorted: true,
    canonicalizationArrayOrderPreserved: true,
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

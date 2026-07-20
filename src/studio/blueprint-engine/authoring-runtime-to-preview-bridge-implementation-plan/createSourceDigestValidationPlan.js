import { REAL_HANDOFF_FIELDS, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * SOURCE DIGEST VALIDATION PLAN — plans deterministic source digest consistency validation aligned to the
 * REAL handoff. The digest field is `handoffDigest` (NOT a generic `digest`); validation mode is
 * `recompute_and_compare` — recompute the runtime's `createDeterministicDigest` (FNV-1a) over the runtime's
 * `stableSerialize` of the handoff minus `handoffDigest`, and compare. The future bridge reuses the runtime
 * serializer/digest READ-ONLY (no alternative serializer). FNV-1a is an internal identity, NOT cryptographic,
 * and may authorize NOTHING real. Metadata only. @returns {Object}
 */
export function createSourceDigestValidationPlan() {
  const preimageFields = REAL_HANDOFF_FIELDS.filter((f) => f !== 'handoffDigest');
  const core = {
    kind: 'bridge-source-digest-validation-plan',
    sourceDigestValidationPlanned: true,
    sourceDigestValidationImplemented: false,
    sourceDigestField: 'handoffDigest',
    genericDigestSourceFieldAllowed: false,
    digestValidationMode: 'recompute_and_compare',
    sourceDigestAlgorithm: 'fnv1a-32',
    sourceDigestPurpose: 'deterministic_internal_identity',
    canonicalSerializer: 'stableSerialize',
    canonicalSerializerPath: 'src/studio/blueprint-engine/module-blueprint-authoring-runtime/stableSerialize.js',
    digestHelper: 'createDeterministicDigest',
    digestHelperPath: 'src/studio/blueprint-engine/module-blueprint-authoring-runtime/createDeterministicDigest.js',
    digestHelperReusedReadOnly: true,
    alternativeSerializerAllowed: false,
    preimageFields,
    preimageFieldCount: preimageFields.length,
    handoffDigestExcludedFromOwnPreimage: true,
    canonicalizationKeySorted: true,
    canonicalizationArrayOrderPreserved: true,
    cryptographicIntegrityProvided: false,
    authenticityProvided: false,
    tamperProofProvided: false,
    digestMayAuthorizeCertification: false,
    digestMayAuthorizeModuleGeneration: false,
    digestMayAuthorizeProduction: false,
    cryptographicDigestRequiredBeforeCertification: true,
    cryptographicDigestRequiredBeforeProduction: true,
    fnv1aInternalOnly: true,
  };
  return safeCloneGenericModel({ ...core, sourceDigestValidationPlanDigest: bridgePlanDigest(core) });
}

export default createSourceDigestValidationPlan;

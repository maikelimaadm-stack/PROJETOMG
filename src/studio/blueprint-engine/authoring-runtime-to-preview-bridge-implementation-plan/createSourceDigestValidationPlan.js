import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * SOURCE DIGEST VALIDATION PLAN — plans deterministic FNV-1a source digest consistency validation only.
 * FNV-1a is an internal identity, NOT cryptographic/authenticity/tamper-proof, and may authorize NOTHING
 * real. A cryptographic digest is required before certification/production. Metadata only. @returns {Object}
 */
export function createSourceDigestValidationPlan() {
  const core = {
    kind: 'bridge-source-digest-validation-plan',
    sourceDigestValidationPlanned: true,
    sourceDigestValidationImplemented: false,
    sourceDigestAlgorithm: 'fnv1a-32',
    sourceDigestPurpose: 'deterministic_internal_identity',
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

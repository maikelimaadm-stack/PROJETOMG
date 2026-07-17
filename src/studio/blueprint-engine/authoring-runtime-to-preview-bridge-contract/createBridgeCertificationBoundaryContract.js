import { REQUIRED_FUTURE_CHECKPOINT, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the CERTIFICATION BOUNDARY contract. The bridge never certifies or self-certifies; a
 * candidate is inert, non-canonical, non-certified metadata. Certification is a future, human-gated,
 * separately-approved slice. Metadata only. @returns {Object}
 */
export function createBridgeCertificationBoundaryContract() {
  const core = {
    kind: 'bridge-certification-boundary-contract',
    certificationPerformed: false,
    selfCertificationAllowed: false,
    candidateCanonical: false,
    candidateCertified: false,
    bridgeMayCertify: false,
    requiresFutureExplicitCertificationSlice: true,
    requiresHumanCheckpointBeforeCertification: true,
    cryptographicDigestRequiredBeforeCertification: true,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
  };
  return safeCloneGenericModel({ ...core, certificationBoundaryContractDigest: bridgeDigest(core) });
}

export default createBridgeCertificationBoundaryContract;

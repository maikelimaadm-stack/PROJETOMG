import { REQUIRED_FUTURE_CHECKPOINT, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * CERTIFICATION BOUNDARY PLAN — the future bridge never certifies or self-certifies; a candidate is inert,
 * non-canonical, non-certified metadata. Certification is a future, human-gated, separately-approved
 * slice, requiring a cryptographic digest first. Metadata only. @returns {Object}
 */
export function createBridgeCertificationBoundaryPlan() {
  const core = {
    kind: 'bridge-certification-boundary-plan',
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
  return safeCloneGenericModel({ ...core, certificationBoundaryPlanDigest: bridgePlanDigest(core) });
}

export default createBridgeCertificationBoundaryPlan;

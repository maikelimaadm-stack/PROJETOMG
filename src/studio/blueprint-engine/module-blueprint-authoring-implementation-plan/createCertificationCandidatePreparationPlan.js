import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { REQUIRED_FUTURE_CHECKPOINT, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Certification candidate preparation PLAN — plans how a future validated draft would PREPARE a
 * `blueprint_certification_candidate` for human review. Preparing a candidate is NOT certification;
 * no certifier exists; the certified SSOT is never altered. Metadata only.
 * @returns {Object}
 */
export function createCertificationCandidatePreparationPlan() {
  const core = {
    kind: 'authoring-certification-candidate-preparation-plan',
    certificationCandidatePlanCreated: true,
    candidateKind: 'blueprint_certification_candidate',
    certificationCandidateCreated: false,
    certificationPerformed: false,
    candidateCanonical: false,
    requiresValidatedDraft: true,
    requiresFutureExplicitSlice: true,
    requiresFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    selfCertificationAllowed: false,
    overwritesCertifiedContract: false,
    certifierImplemented: false,
  };
  return safeCloneGenericModel({ ...core, certificationCandidatePreparationPlanDigest: authoringPlanDigest(core) });
}

export default createCertificationCandidatePreparationPlan;

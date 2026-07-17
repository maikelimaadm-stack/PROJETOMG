import { AUTHORING_RUNTIME_VERSION, SOURCE_CHECKPOINT } from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Prepares CERTIFICATION CANDIDATE metadata from a validated draft snapshot. Preparing a candidate is
 * NOT certification: nothing is certified, published, registered, generated, or written to the SSOT.
 * Requires a validated draft; otherwise fail-closed. Pure. @param {Object} [options] @returns {Object}
 */
export function createCertificationCandidatePreparation(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const draft = isPlainObject(o.draft) ? o.draft : {};
  const validated = draft.lifecycleState === 'handoff_ready' || draft.lifecycleState === 'preview_ready'
    || (isPlainObject(draft.validation) && draft.validation.passed === true);

  const core = {
    kind: 'authoring-certification-candidate-preparation',
    candidateKind: 'blueprint_certification_candidate',
    candidateVersion: 'authoring-certification-candidate@1.0.0',
    runtimeVersion: AUTHORING_RUNTIME_VERSION,
    draftId: typeof draft.draftId === 'string' ? draft.draftId : null,
    draftRevision: Number.isFinite(Number(draft.revision)) ? Number(draft.revision) : null,
    draftDigest: typeof draft.digest === 'string' ? draft.digest : null,
    candidateCreated: validated,
    certified: false,
    canonical: false,
    registered: false,
    published: false,
    moduleGenerated: false,
    requiresFutureExplicitSlice: true,
    requiresHumanCheckpoint: true,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    selfCertificationAllowed: false,
    ok: validated,
  };
  return Object.freeze({ ...core, candidateDigest: createDeterministicDigest(core) });
}

export default createCertificationCandidatePreparation;

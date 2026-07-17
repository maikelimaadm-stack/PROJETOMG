import { VALIDATION_PIPELINE_STAGES } from './authoringRuntimeConfig.js';
import { isPlainObject } from './normalizeAuthoringInput.js';
import { createValidationIssue, sortValidationIssues } from './createValidationIssue.js';
import { enforceAuthoringInvariants } from './createInvariantEnforcer.js';
import { enforceAuthoringResourceLimits } from './enforceAuthoringResourceLimits.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/** The validation pipeline descriptor (pure data). @returns {Object} */
export function createValidationPipeline() {
  const core = {
    kind: 'authoring-validation-pipeline',
    stages: [...VALIDATION_PIPELINE_STAGES],
    stageCount: VALIDATION_PIPELINE_STAGES.length,
    failClosed: true,
    deterministicIssues: true,
    validationPipelineImplemented: true,
    blockerStopsPreview: true,
    blockerStopsCertificationCandidate: true,
  };
  return Object.freeze({ ...core, validationPipelineDigest: createDeterministicDigest(core) });
}

/**
 * Runs the deterministic, fail-closed validation pipeline over a draft snapshot. Returns a frozen
 * report with ordered issues, blocker count and pass/fail. Respects maxValidationIssuesPerRun. Pure.
 * @param {Object} options @returns {Object}
 */
export function runValidationPipeline(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const draft = isPlainObject(o.draft) ? o.draft : {};
  const limits = isPlainObject(o.limits) ? o.limits : {};
  let issues = [];

  // Structural + boundary invariants (mapped across stages).
  issues = issues.concat(enforceAuthoringInvariants(draft, 'field_uniqueness_validation'));

  // shape_validation
  if (!draft.kind || draft.kind !== 'authoring-draft-snapshot') {
    issues.push(createValidationIssue({ issueCode: 'shape_invalid', severity: 'blocker', stage: 'shape_validation', path: 'draft', message: 'Draft snapshot shape invalid' }));
  }
  // identifier_validation
  if (typeof draft.draftId !== 'string' || draft.draftId.length === 0) {
    issues.push(createValidationIssue({ issueCode: 'identifier_missing', severity: 'blocker', stage: 'identifier_validation', path: 'draftId', message: 'Draft id required' }));
  }
  // ssot_boundary_validation
  if (draft.canonical === true || draft.certified === true) {
    issues.push(createValidationIssue({ issueCode: 'ssot_inversion', severity: 'blocker', stage: 'ssot_boundary_validation', path: 'draft', message: 'Draft must not be canonical/certified' }));
  }

  // Fail-closed on issue-count limit (deterministic; no silent truncation).
  const capCheck = enforceAuthoringResourceLimits({ limits, dimension: 'validationIssues', count: issues.length });
  if (!capCheck.ok) {
    issues.push(createValidationIssue({ issueCode: capCheck.issueCode, severity: 'blocker', stage: 'module_generation_validation', path: 'validation', message: 'Validation issue limit exceeded' }));
  }

  const ordered = sortValidationIssues(issues, VALIDATION_PIPELINE_STAGES);
  const blockerCount = ordered.filter((i) => i.severity === 'blocker' || i.severity === 'error').length;
  const core = {
    kind: 'authoring-validation-report',
    ran: true,
    issues: ordered,
    issueCount: ordered.length,
    blockerCount,
    passed: blockerCount === 0,
    stages: [...VALIDATION_PIPELINE_STAGES],
  };
  return Object.freeze({ ...core, validationReportDigest: createDeterministicDigest(core) });
}

export default createValidationPipeline;

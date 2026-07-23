import { deepFreeze } from './deepFreeze.js';
/** FUTURE builder validation pipeline (fixed 23-stage order). NOT executed. Envelope only after ALL blockers pass. */
export const BUILDER_PIPELINE_STAGES = Object.freeze([
  'source_structure_normalization', 'source_decision_shape_validation', 'source_decision_eligibility_validation',
  'source_version_validation', 'source_security_boundary_validation', 'source_target_descriptor_validation',
  'core_allowlist_resolution', 'core_extraction_validation', 'core_completeness_validation',
  'core_extra_field_validation', 'digest_presence_validation', 'digest_recompute_validation',
  'same_decision_atomicity_validation', 'core_envelope_version_validation', 'core_envelope_shape_validation',
  'identity_verification_state_validation', 'ssot_boundary_validation', 'preview_mount_boundary_validation',
  'real_data_boundary_validation', 'module_generation_boundary_validation', 'certification_boundary_validation',
  'product_exposure_boundary_validation', 'prototype_reference_validation',
]);
// Core may only be created at/after core_extraction_validation; envelope only after ALL blockers pass.
const CORE_STAGE_INDEX = BUILDER_PIPELINE_STAGES.indexOf('core_extraction_validation');
const S = (stage, i) => deepFreeze({
  stageId: stage, order: i + 1, blocking: true, deterministic: true, futureFunction: `validate_${stage}`,
  mayCreateCore: i >= CORE_STAGE_INDEX, mayCreateEnvelope: false,
});
export const VALIDATION_PIPELINE_CONTRACT = deepFreeze({
  kind: 'builder-validation-pipeline-contract',
  stages: [...BUILDER_PIPELINE_STAGES],
  stageCount: BUILDER_PIPELINE_STAGES.length, // 23
  detailedStages: deepFreeze(BUILDER_PIPELINE_STAGES.map((s, i) => S(s, i))),
  atomic: true, deterministicOrder: true, envelopeOnlyAfterAllBlockers: true,
  pipelineImplemented: false, validationExecuted: false,
});
export default VALIDATION_PIPELINE_CONTRACT;

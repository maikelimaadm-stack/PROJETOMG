import { deepFreeze } from './deepFreeze.js';
/**
 * Aligns the pipeline: a Core Envelope v2 PREFLIGHT runs BEFORE the existing 17-stage consumer pipeline (chosen
 * over substitution to avoid duplication/ambiguity). Declaration only.
 */
export const PREFLIGHT_STAGES = Object.freeze([
  'core_envelope_shape_validation', 'core_field_completeness_validation', 'core_extra_field_validation',
  'core_digest_recompute_validation', 'core_same_decision_atomicity_validation',
]);
export const PIPELINE_ALIGNMENT = deepFreeze({
  kind: 'pipeline-alignment',
  order: 'core_envelope_v2_preflight_then_17_stage_consumer_pipeline',
  preflightStages: [...PREFLIGHT_STAGES],
  preflightStageCount: PREFLIGHT_STAGES.length, // 5
  consumerPipelineStageCount: 17,
  preflightSubstitutesConsumerStages: false,
  preflightPrecedesConsumerPipeline: true,
  noDuplicationNoAmbiguity: true,
  sandboxDescriptorOnlyAfterAllBlockers: true,
  pipelineImplemented: false, validationExecuted: false,
});
export default PIPELINE_ALIGNMENT;

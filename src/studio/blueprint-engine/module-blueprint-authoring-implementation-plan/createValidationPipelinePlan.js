import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { VALIDATION_PIPELINE_STAGES, authoringPlanDigest } from './authoringImplementationPlanConfig.js';

/**
 * Validation pipeline PLAN — plans deterministic, fail-closed validation stages; a blocker stops
 * preview and certification-candidate handoff. Metadata only.
 * @returns {Object}
 */
export function createValidationPipelinePlan() {
  const stages = VALIDATION_PIPELINE_STAGES.map((id, index) => ({ stageId: id, order: index, planned: true, implemented: false }));
  const core = {
    kind: 'authoring-validation-pipeline-plan',
    validationPipelinePlanned: true,
    validationPipelineImplemented: false,
    failClosed: true,
    deterministicIssues: true,
    blockerStopsPreview: true,
    blockerStopsCertificationCandidate: true,
    severities: ['info', 'warning', 'error', 'blocker'],
    stages,
    stageCount: stages.length,
  };
  return safeCloneGenericModel({ ...core, validationPipelinePlanDigest: authoringPlanDigest(core) });
}

export default createValidationPipelinePlan;

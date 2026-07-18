import { BRIDGE_VALIDATION_STAGES, BRIDGE_ISSUE_SEVERITIES, bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * VALIDATION PIPELINE PLAN — plans the 13 fixed-order, deterministic, fail-closed stages. Blocker stops
 * the bridge and the preview sandbox handoff; no silent auto-correction; no permissive fallback. Not
 * implemented here. Metadata only. @returns {Object}
 */
export function createBridgeValidationPipelinePlan() {
  const stages = BRIDGE_VALIDATION_STAGES.map((id, index) => ({ stageId: id, order: index, failClosed: true, implemented: false }));
  const core = {
    kind: 'bridge-validation-pipeline-plan',
    validationPipelinePlanned: true,
    validationPipelineImplemented: false,
    stages,
    stageCount: stages.length,
    stageIds: [...BRIDGE_VALIDATION_STAGES],
    severities: [...BRIDGE_ISSUE_SEVERITIES],
    deterministicIssueOrdering: true,
    blockerStopsBridge: true,
    blockerStopsPreviewSandbox: true,
    silentAutoCorrectionAllowed: false,
    permissiveFallbackAllowed: false,
  };
  return safeCloneGenericModel({ ...core, validationPipelinePlanDigest: bridgePlanDigest(core) });
}

export default createBridgeValidationPipelinePlan;

import { BRIDGE_VALIDATION_STAGES, BRIDGE_ISSUE_SEVERITIES, bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the VALIDATION PIPELINE contract — 13 fixed-order, deterministic, fail-closed stages with no
 * auto-correction and no permissive fallback. Metadata only (the runtime validator is a future slice).
 * @returns {Object}
 */
export function createBridgeValidationPipelineContract() {
  const stages = BRIDGE_VALIDATION_STAGES.map((id, index) => ({ stageId: id, order: index, failClosed: true, implemented: false }));
  const core = {
    kind: 'bridge-validation-pipeline-contract',
    stages,
    stageCount: stages.length,
    stageIds: [...BRIDGE_VALIDATION_STAGES],
    severities: [...BRIDGE_ISSUE_SEVERITIES],
    failClosed: true,
    deterministicIssues: true,
    autoCorrectionAllowed: false,
    permissiveFallbackAllowed: false,
    blockerBlocksBridge: true,
    blockerBlocksPreviewSandbox: true,
    validationRuntimeImplemented: false,
  };
  return safeCloneGenericModel({ ...core, validationPipelineContractDigest: bridgeDigest(core) });
}

export default createBridgeValidationPipelineContract;

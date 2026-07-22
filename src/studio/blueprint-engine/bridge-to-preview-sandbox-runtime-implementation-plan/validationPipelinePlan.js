import { REAL_ENVELOPE_VALIDATION_STAGES } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * 17-STAGE VALIDATION PIPELINE PLAN — reflects the REAL fixed-order stages from the merged Bridge Decision
 * Envelope Identity Contract (#488) `ENVELOPE_VALIDATION_STAGES`. Declaration only; the pipeline is NOT executed.
 * The sandbox descriptor may be created only AFTER every blocking stage passes.
 */
const REAL_STAGES = [...REAL_ENVELOPE_VALIDATION_STAGES];

// Stages after which no sandbox descriptor can be built if they block. Every stage is blocking (fail-closed);
// the descriptor build is a post-pipeline action, never mid-pipeline.
const STAGE = (order, stage, futureValidator, issueCodes) => deepFreeze({
  order, stage, blocking: true, futureValidator, issueCodes: Object.freeze([...issueCodes]),
  mayCreateSandboxDescriptor: false, // only the post-pipeline build step may, after ALL stages pass
  preconditions: order === 1 ? Object.freeze(['normalized input']) : Object.freeze([`stage ${order - 1} passed`]),
  postconditions: Object.freeze([`stage ${order} passed or blocker raised`]),
  implementationStatus: 'planned',
});

const STAGE_ISSUE_CODES = {
  source_decision_shape_validation: ['RUNTIME_ENVELOPE_REQUIRED', 'RUNTIME_ENVELOPE_INVENTED_FIELD'],
  source_decision_status_validation: ['RUNTIME_SOURCE_DECISION_WRONG_STATUS'],
  source_decision_digest_validation: ['RUNTIME_BRIDGE_DECISION_DIGEST_REQUIRED', 'RUNTIME_DECISION_DIGEST_MISMATCH'],
  target_descriptor_presence_validation: ['RUNTIME_TARGET_DESCRIPTOR_REQUIRED'],
  target_descriptor_shape_validation: ['RUNTIME_SANDBOX_DESCRIPTOR_SHAPE_INVALID'],
  decision_descriptor_pair_validation: ['RUNTIME_DECISION_DESCRIPTOR_MISMATCH', 'RUNTIME_CROSS_DECISION_MIX_FORBIDDEN'],
  source_version_validation: ['RUNTIME_SOURCE_VERSION_MISMATCH', 'RUNTIME_VERSION_UNKNOWN'],
  target_version_validation: ['RUNTIME_SOURCE_VERSION_MISMATCH'],
  synthetic_boundary_validation: ['RUNTIME_NOT_SYNTHETIC'],
  security_boundary_validation: ['RUNTIME_SECURITY_FLAG_FORBIDDEN'],
  ssot_boundary_validation: ['RUNTIME_SSOT_INVERSION_FORBIDDEN'],
  preview_mount_boundary_validation: ['RUNTIME_PREVIEW_MOUNT_FORBIDDEN'],
  real_data_boundary_validation: ['RUNTIME_REAL_DATA_FORBIDDEN'],
  module_generation_boundary_validation: ['RUNTIME_MODULE_GENERATION_FORBIDDEN'],
  certification_boundary_validation: ['RUNTIME_CERTIFICATION_FORBIDDEN'],
  product_exposure_boundary_validation: ['RUNTIME_PRODUCT_EXPOSURE_FORBIDDEN'],
  prototype_reference_validation: ['RUNTIME_PROTOTYPE_REFERENCE_FORBIDDEN'],
};

export const VALIDATION_PIPELINE_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-validation-pipeline-plan',
  stages: REAL_STAGES,
  stageCount: REAL_STAGES.length, // 17
  detailedStages: deepFreeze(REAL_STAGES.map((s, i) => STAGE(i + 1, s, `validate_${s}`, STAGE_ISSUE_CODES[s] || []))),
  atomic: true,
  deterministicOrder: true,
  blockerStopsSandboxDescriptor: true,
  sandboxDescriptorCreatedOnlyAfterAllBlockersPass: true,
  pipelineImplemented: false,
  validationExecuted: false,
});

export default VALIDATION_PIPELINE_PLAN;

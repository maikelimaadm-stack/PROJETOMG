import {
  BUILDER_CONTRACT_VERSION, SOURCE_CORE_ENVELOPE_CONTRACT_VERSION, SOURCE_ENVELOPE_V1_CONTRACT_VERSION,
  SOURCE_PLAN_ALIGNMENT_AMENDMENT_VERSION, SOURCE_BRIDGE_RUNTIME_VERSION, SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
  SOURCE_BLUEPRINT_CONTRACT_VERSION, REAL_SOURCE_BRIDGE_DECISION_FIELDS, REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS,
  SOURCE_SUCCESS_ELIGIBILITY_FIELDS, DIGEST_PREIMAGE_ALLOWLIST, REQUIRED_CORE_FIELDS_REF, CORE_FIELD_COUNT_REF,
  OUTPUT_CORE_ENVELOPE_FIELDS, OUTPUT_CORE_ENVELOPE_INVARIANTS, BUILDER_PIPELINE_STAGES, BUILDER_ISSUE_CODES,
  RESOURCE_DIMENSION_NAMES, SOURCE_DECISION_KIND, SOURCE_DECISION_SUCCESS_STATUS, SOURCE_DIGEST_FIELD,
  createStudioBridgeDecisionCoreEnvelopeBuilderContract,
} from '../bridge-decision-core-envelope-builder-contract/index.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * Live READ-ONLY traceability of the audited Builder Contract. No local divergent lists — every count and array is
 * derived from the real merged upstream. Proves 33 source fields, 32 core/allowlist fields, 12 envelope fields,
 * consumer_runtime ownership, ARCHITECTURE 1 final, and B-CORE-ENVELOPE-BUILDER closed-by-contract.
 */
const CONTRACT = createStudioBridgeDecisionCoreEnvelopeBuilderContract();

export const SOURCE_TRACEABILITY = deepFreeze({
  kind: 'builder-implementation-plan-source-traceability',
  builderContractVersion: BUILDER_CONTRACT_VERSION,
  upstreamVersions: {
    coreEnvelopeContractV2: SOURCE_CORE_ENVELOPE_CONTRACT_VERSION,
    envelopeIdentityV1: SOURCE_ENVELOPE_V1_CONTRACT_VERSION,
    planAlignmentAmendment: SOURCE_PLAN_ALIGNMENT_AMENDMENT_VERSION,
    hardenedBridgeRuntime: SOURCE_BRIDGE_RUNTIME_VERSION,
    previewSandboxContract: SOURCE_PREVIEW_SANDBOX_CONTRACT_VERSION,
    blueprintContract: SOURCE_BLUEPRINT_CONTRACT_VERSION,
  },
  sourceDecisionKind: SOURCE_DECISION_KIND,
  sourceDecisionSuccessStatus: SOURCE_DECISION_SUCCESS_STATUS,
  sourceDigestField: SOURCE_DIGEST_FIELD,
  sourceFieldCount: REAL_SOURCE_BRIDGE_DECISION_FIELDS.length,
  requiredSourceFieldCount: REQUIRED_SOURCE_BRIDGE_DECISION_FIELDS.length,
  successEligibilityFieldCount: SOURCE_SUCCESS_ELIGIBILITY_FIELDS.length,
  coreAllowlistFieldCount: DIGEST_PREIMAGE_ALLOWLIST.length,
  requiredCoreFieldCount: REQUIRED_CORE_FIELDS_REF.length,
  coreFieldCountRef: CORE_FIELD_COUNT_REF,
  envelopeFieldCount: OUTPUT_CORE_ENVELOPE_FIELDS.length,
  envelopeInvariantIdentityVerified: OUTPUT_CORE_ENVELOPE_INVARIANTS.identityVerified,
  pipelineStageCount: BUILDER_PIPELINE_STAGES.length,
  issueCodeCount: BUILDER_ISSUE_CODES.length,
  resourceDimensionCount: RESOURCE_DIMENSION_NAMES.length,
  // Real field arrays (frozen copies) — the plan MUST NOT maintain a divergent local list.
  sourceFields: deepFreeze([...REAL_SOURCE_BRIDGE_DECISION_FIELDS]),
  coreAllowlist: deepFreeze([...DIGEST_PREIMAGE_ALLOWLIST]),
  envelopeFields: deepFreeze([...OUTPUT_CORE_ENVELOPE_FIELDS]),
  pipelineStages: deepFreeze([...BUILDER_PIPELINE_STAGES]),
  // Audited contract state.
  identityVerifiedSemanticOwner: CONTRACT.identityVerifiedSemanticOwner,
  verificationStateClassification: CONTRACT.verificationStateClassification,
  coreEnvelopeVerificationStateAmendmentRequired: CONTRACT.coreEnvelopeVerificationStateAmendmentRequired,
  bCoreEnvelopeBuilderClosedByContract: CONTRACT.bCoreEnvelopeBuilderClosedByContract,
  bCoreEnvelopeVerificationStateOpen: CONTRACT.bCoreEnvelopeVerificationStateOpen,
  readyForBuilderImplementationPlan: CONTRACT.readyForBuilderImplementationPlan,
  builderContractManifestDigest: CONTRACT.manifest.overallDigest,
  builderContractVerificationOk: CONTRACT.verification.ok,
});
export default SOURCE_TRACEABILITY;

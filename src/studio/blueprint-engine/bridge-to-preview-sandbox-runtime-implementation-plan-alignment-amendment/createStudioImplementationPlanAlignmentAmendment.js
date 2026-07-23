import {
  AMENDMENT_NAME, AMENDMENT_VERSION, AMENDMENT_MODE, AMENDMENT_CAPABILITIES, SELECTED_ARCHITECTURE,
  SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT,
} from './amendmentConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { SOURCE_PLAN_TRACEABILITY } from './sourcePlanTraceability.js';
import { CORE_ENVELOPE_CONTRACT_TRACEABILITY } from './coreEnvelopeContractTraceability.js';
import { SUPERSESSION_CONTRACT } from './supersessionContract.js';
import { SOURCE_ENVELOPE_ALIGNMENT } from './sourceEnvelopeAlignment.js';
import { DIGEST_RECOMPUTATION_ALIGNMENT } from './digestRecomputationAlignment.js';
import { B_RECOMPUTE_INPUT_TRANSITION } from './bRecomputeInputTransition.js';
import { PHASE_ALIGNMENT } from './phaseAlignment.js';
import { FUTURE_FILE_MAP_ALIGNMENT } from './futureFileMapAlignment.js';
import { FUTURE_PUBLIC_API_ALIGNMENT } from './futurePublicApiAlignment.js';
import { PIPELINE_ALIGNMENT } from './pipelineAlignment.js';
import { MAPPING_ALIGNMENT } from './mappingAlignment.js';
import { FAILURE_CONTAINMENT_ALIGNMENT } from './failureContainmentAlignment.js';
import { RESOURCE_LIMITS_ALIGNMENT } from './resourceLimitsAlignment.js';
import { TEST_STRATEGY_ALIGNMENT } from './testStrategyAlignment.js';
import { GATE_STRATEGY_ALIGNMENT } from './gateStrategyAlignment.js';
import { RISK_MATRIX_ALIGNMENT } from './riskMatrixAlignment.js';
import { CORE_ENVELOPE_BUILDER_REQUIREMENT } from './coreEnvelopeBuilderRequirement.js';
import { MANUAL_CHECKPOINT_ALIGNMENT } from './manualCheckpointAlignment.js';
import { createAmendmentReadinessDecision } from './amendmentReadinessDecision.js';
import { createAmendmentManifest } from './amendmentManifest.js';
import { checkImplementationPlanAlignmentCompatibility } from './checkImplementationPlanAlignmentCompatibility.js';
import { verifyImplementationPlanAlignmentAmendment } from './verifyImplementationPlanAlignmentAmendment.js';
import { createAmendmentDiagnostics } from './amendmentDiagnostics.js';

/**
 * Composes the STUDIO IMPLEMENTATION PLAN ALIGNMENT AMENDMENT. Amendment only — it aligns the merged plan (#489)
 * to the Core Envelope v2 contract (#490), supersedes Option A, selects Option B, resolves B-RECOMPUTE-INPUT at
 * plan level, opens B-CORE-ENVELOPE-BUILDER and keeps runtime blocked. It modifies no upstream file and implements
 * no runtime/builder/verifier — every implementation flag is false. @param {Object} [options] @returns {Object}
 */
export function createStudioImplementationPlanAlignmentAmendment(options = {}) {
  const parts = {
    config: { name: AMENDMENT_NAME, version: AMENDMENT_VERSION, mode: AMENDMENT_MODE },
    sourcePlanTraceability: SOURCE_PLAN_TRACEABILITY,
    coreEnvelopeContractTraceability: CORE_ENVELOPE_CONTRACT_TRACEABILITY,
    supersession: SUPERSESSION_CONTRACT,
    sourceEnvelopeAlignment: SOURCE_ENVELOPE_ALIGNMENT,
    digestRecomputationAlignment: DIGEST_RECOMPUTATION_ALIGNMENT,
    bRecomputeInputTransition: B_RECOMPUTE_INPUT_TRANSITION,
    phaseAlignment: PHASE_ALIGNMENT,
    futureFileMapAlignment: FUTURE_FILE_MAP_ALIGNMENT,
    futurePublicApiAlignment: FUTURE_PUBLIC_API_ALIGNMENT,
    pipelineAlignment: PIPELINE_ALIGNMENT,
    mappingAlignment: MAPPING_ALIGNMENT,
    failureContainmentAlignment: FAILURE_CONTAINMENT_ALIGNMENT,
    resourceLimitsAlignment: RESOURCE_LIMITS_ALIGNMENT,
    testStrategyAlignment: TEST_STRATEGY_ALIGNMENT,
    gateStrategyAlignment: GATE_STRATEGY_ALIGNMENT,
    riskMatrixAlignment: RISK_MATRIX_ALIGNMENT,
    coreEnvelopeBuilderRequirement: CORE_ENVELOPE_BUILDER_REQUIREMENT,
    manualCheckpoint: MANUAL_CHECKPOINT_ALIGNMENT,
  };

  const bRecomputeInputResolvedByPlan = DIGEST_RECOMPUTATION_ALIGNMENT.bRecomputeInputResolvedByPlan === true;
  const bCoreEnvelopeBuilderOpen = CORE_ENVELOPE_BUILDER_REQUIREMENT.bCoreEnvelopeBuilderOpen === true;
  const readinessDecision = createAmendmentReadinessDecision({
    blockers: [], amendmentFullyDefined: true, bRecomputeInputResolvedByPlan, bCoreEnvelopeBuilderOpen,
  });
  const manifest = createAmendmentManifest({ parts });
  const compatibility = checkImplementationPlanAlignmentCompatibility();

  const base = {
    kind: 'studio-bridge-to-preview-sandbox-runtime-implementation-plan-alignment-amendment',
    amendmentName: AMENDMENT_NAME,
    amendmentVersion: AMENDMENT_VERSION,
    mode: AMENDMENT_MODE,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceCheckpointDecision: SOURCE_DECISION,
    sourceRecommendation: SOURCE_RECOMMENDATION,
    selectedArchitecture: SELECTED_ARCHITECTURE,
    currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    ...parts,
    capabilities: { ...AMENDMENT_CAPABILITIES },
    compatibility,
    readinessDecision,
    readiness: readinessDecision.readiness,
    manifest,
    // ---- Amendment state flags (§27). ----
    alignmentAmendmentDefined: true,
    sourcePlanCaptured: true,
    coreEnvelopeContractCaptured: true,
    supersessionDefined: true,
    sourceEnvelopeAligned: true,
    digestRecomputationAligned: true,
    phaseAlignmentDefined: true,
    futureFileMapAligned: true,
    futureApiAligned: true,
    pipelineAligned: true,
    mappingsAligned: true,
    failureContainmentAligned: true,
    resourceLimitsAligned: true,
    testStrategyAligned: true,
    gateStrategyAligned: true,
    riskMatrixAligned: true,
    manualCheckpointsAligned: true,
    // ---- Blocker / architecture state. ----
    bIdentityClosedByContract: true,
    bRecomputeInputClosedByContract: true,
    bRecomputeInputResolvedByPlan,
    implementationPlanAlignedToCoreEnvelopeV2: true,
    coreEnvelopeBuilderContractRequiredBeforeRuntime: true,
    bCoreEnvelopeBuilderOpen,
    // ---- Nothing implemented. ----
    runtimeImplemented: false,
    runtimeFactoryImplemented: false,
    executeImplemented: false,
    coreEnvelopeBuilderImplemented: false,
    coreExtractorImplemented: false,
    identityVerificationImplemented: false,
    digestRecomputeImplemented: false,
    mappingExecutorImplemented: false,
    sandboxDescriptorBuilderImplemented: false,
    consumerDecisionImplemented: false,
    previewMounted: false,
    appTouched: false,
    routeCreated: false,
    menuCreated: false,
    persistenceImplemented: false,
    backendAccessed: false,
    prismaAccessed: false,
    networkUsed: false,
    realDataRead: false,
    moduleGenerated: false,
    certificationPerformed: false,
    productExposed: false,
    productionAccessed: false,
    // ---- Readiness gates. ----
    readyForEnterpriseAlignmentAudit: true,
    readyForCoreEnvelopeBuilderContract: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    amendmentOnly: true,
    metadataOnly: true,
  };

  const verification = verifyImplementationPlanAlignmentAmendment({ amendment: base });
  const diagnostics = createAmendmentDiagnostics({ verification });

  return Object.freeze(deepFreeze({ ...base, verification, diagnostics }));
}

export default createStudioImplementationPlanAlignmentAmendment;

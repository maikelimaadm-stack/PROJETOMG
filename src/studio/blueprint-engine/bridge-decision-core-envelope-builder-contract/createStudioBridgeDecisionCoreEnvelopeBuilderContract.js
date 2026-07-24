import {
  BUILDER_CONTRACT_NAME, BUILDER_CONTRACT_VERSION, BUILDER_CONTRACT_MODE, BUILDER_CAPABILITIES, BUILDER_DECISION_STATUSES,
  SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, SELECTED_ARCHITECTURE, CURRENT_SLICE_AUTHORIZATION,
  REQUIRED_FUTURE_CHECKPOINT,
} from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
import { REAL_SOURCE_BRIDGE_DECISION_SHAPE } from './realSourceBridgeDecisionShape.js';
import { SOURCE_ELIGIBILITY_CONTRACT } from './sourceEligibilityContract.js';
import { CORE_EXTRACTION_CONTRACT } from './coreExtractionContract.js';
import { DIGEST_RECOMPUTE_CONTRACT } from './digestRecomputeContract.js';
import { SAME_DECISION_ATOMICITY_CONTRACT } from './sameDecisionAtomicityContract.js';
import { FUTURE_BUILDER_PUBLIC_API_CONTRACT } from './futureBuilderPublicApiContract.js';
import { OUTPUT_ENVELOPE_CONTRACT } from './outputEnvelopeContract.js';
import { IDENTITY_VERIFICATION_STATE_CONTRACT } from './identityVerificationStateContract.js';
import { SAFE_NORMALIZATION_CONTRACT } from './safeNormalizationContract.js';
import { VALIDATION_PIPELINE_CONTRACT } from './validationPipelineContract.js';
import { ISSUE_MODEL_CONTRACT } from './issueModelContract.js';
import { FAILURE_CONTAINMENT_CONTRACT } from './failureContainmentContract.js';
import { RESOURCE_LIMITS_CONTRACT } from './resourceLimitsContract.js';
import { EXTENSIBILITY_CONTRACT } from './extensibilityContract.js';
import { REPLAY_IDEMPOTENCY_CONTRACT } from './replayIdempotencyContract.js';
import { SSOT_SECURITY_PERMISSION_CONTRACT } from './ssotSecurityPermissionContract.js';
import { PROTOTYPE_RELINK_PROHIBITION } from './prototypeRelinkProhibition.js';
import { BUILDER_BLOCKER_CLOSURE } from './builderBlockerClosure.js';
import { MANUAL_ENABLEMENT_GATE } from './manualEnablementGate.js';
import { createBuilderContractReadinessDecision } from './contractReadinessDecision.js';
import { createBuilderContractManifest } from './contractManifest.js';
import { checkBridgeDecisionCoreEnvelopeBuilderCompatibility } from './checkBridgeDecisionCoreEnvelopeBuilderCompatibility.js';
import { verifyBridgeDecisionCoreEnvelopeBuilderContract } from './verifyBridgeDecisionCoreEnvelopeBuilderContract.js';
import { createBuilderContractDiagnostics } from './contractDiagnostics.js';

/**
 * Composes the STUDIO BRIDGE DECISION CORE ENVELOPE BUILDER CONTRACT. Definition only — no builder is built, no
 * decision consumed, no core extracted at runtime, no digest recomputed at runtime, no envelope emitted, nothing
 * mounted or exposed. Deterministic, immutable (deep-frozen), fail-closed, side-effect-free. Closes the
 * B-CORE-ENVELOPE-BUILDER blocker by contract; classifies B-CORE-ENVELOPE-VERIFICATION-STATE as NOT_A_BLOCKER
 * (identityVerified is consumer-owned; builder verification lives in the builder decision; the immutable
 * pre-consumer envelope stays false; no amendment required). The contract is technically ready for the Builder
 * Implementation Plan audit, but this slice's manual gate does NOT authorize executing that plan, and builder
 * implementation and runtime stay blocked.
 * @param {Object} [options] @returns {Object}
 */
export function createStudioBridgeDecisionCoreEnvelopeBuilderContract(options = {}) {
  const parts = {
    config: { name: BUILDER_CONTRACT_NAME, version: BUILDER_CONTRACT_VERSION, mode: BUILDER_CONTRACT_MODE },
    realSourceBridgeDecisionShape: REAL_SOURCE_BRIDGE_DECISION_SHAPE,
    sourceEligibility: SOURCE_ELIGIBILITY_CONTRACT,
    coreExtraction: CORE_EXTRACTION_CONTRACT,
    digestRecompute: DIGEST_RECOMPUTE_CONTRACT,
    sameDecisionAtomicity: SAME_DECISION_ATOMICITY_CONTRACT,
    futureBuilderPublicApi: FUTURE_BUILDER_PUBLIC_API_CONTRACT,
    outputEnvelope: OUTPUT_ENVELOPE_CONTRACT,
    identityVerificationState: IDENTITY_VERIFICATION_STATE_CONTRACT,
    safeNormalization: SAFE_NORMALIZATION_CONTRACT,
    validationPipeline: VALIDATION_PIPELINE_CONTRACT,
    issueModel: ISSUE_MODEL_CONTRACT,
    failureContainment: FAILURE_CONTAINMENT_CONTRACT,
    resourceLimits: RESOURCE_LIMITS_CONTRACT,
    extensibility: EXTENSIBILITY_CONTRACT,
    replayContract: REPLAY_IDEMPOTENCY_CONTRACT,
    ssotSecurityPermission: SSOT_SECURITY_PERMISSION_CONTRACT,
    prototypeRelinkProhibition: PROTOTYPE_RELINK_PROHIBITION,
    builderBlockerClosure: BUILDER_BLOCKER_CLOSURE,
    manualEnablementGate: MANUAL_ENABLEMENT_GATE,
  };

  const bCoreEnvelopeVerificationStateOpen = IDENTITY_VERIFICATION_STATE_CONTRACT.bCoreEnvelopeVerificationStateOpen === true;
  const bCoreEnvelopeBuilderClosedByContract = BUILDER_BLOCKER_CLOSURE.bCoreEnvelopeBuilderClosedByContract === true;
  const readinessDecision = createBuilderContractReadinessDecision({
    blockers: [], contractFullyDefined: true, bCoreEnvelopeBuilderClosedByContract, bCoreEnvelopeVerificationStateOpen,
  });
  const manifest = createBuilderContractManifest({ parts });
  const compatibility = checkBridgeDecisionCoreEnvelopeBuilderCompatibility();

  const base = {
    kind: 'studio-bridge-decision-core-envelope-builder-contract',
    contractName: BUILDER_CONTRACT_NAME,
    contractVersion: BUILDER_CONTRACT_VERSION,
    mode: BUILDER_CONTRACT_MODE,
    fallback: false,
    sourceCheckpoint: SOURCE_CHECKPOINT,
    sourceCheckpointDecision: SOURCE_DECISION,
    sourceRecommendation: SOURCE_RECOMMENDATION,
    selectedArchitecture: SELECTED_ARCHITECTURE,
    currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
    requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
    ...parts,
    builderDecisionStatuses: [...BUILDER_DECISION_STATUSES],
    capabilities: { ...BUILDER_CAPABILITIES },
    compatibility,
    readinessDecision,
    readiness: readinessDecision.readiness,
    manifest,
    contractDefined: true,
    // ---- Blocker / architecture state. ----
    bIdentityClosedByContract: true,
    bRecomputeInputClosedByContract: true,
    bRecomputeInputResolvedByPlan: true,
    bCoreEnvelopeBuilderClosedByContract,
    bCoreEnvelopeVerificationStateOpen,
    // ---- identityVerified semantic classification (corrected). ----
    identityVerifiedSemanticOwner: IDENTITY_VERIFICATION_STATE_CONTRACT.identityVerifiedSemanticOwner,
    verificationStateClassification: IDENTITY_VERIFICATION_STATE_CONTRACT.verificationStateClassification,
    identityVerifiedArchitecture: IDENTITY_VERIFICATION_STATE_CONTRACT.selectedArchitecture,
    coreEnvelopeVerificationStateAmendmentRequired: IDENTITY_VERIFICATION_STATE_CONTRACT.coreEnvelopeVerificationStateAmendmentRequired === true,
    requiredAmendment: IDENTITY_VERIFICATION_STATE_CONTRACT.requiredAmendment,
    builderResultCarriesVerifiedOutsideEnvelope: IDENTITY_VERIFICATION_STATE_CONTRACT.builderResultCarriesVerifiedOutsideEnvelope === true,
    envelopeIdentityVerifiedRemainsFalse: IDENTITY_VERIFICATION_STATE_CONTRACT.envelopeIdentityVerifiedRemainsFalse === true,
    consumerPerformsIndependentVerification: IDENTITY_VERIFICATION_STATE_CONTRACT.consumerPerformsIndependentVerification === true,
    builderImplementationPlanRequired: true,
    // ---- Nothing implemented. ----
    builderFactoryImplemented: false,
    buildImplemented: false,
    coreExtractionImplemented: false,
    digestRecomputeImplemented: false,
    identityVerificationImplemented: false,
    envelopeConstructionImplemented: false,
    consumerRuntimeImplemented: false,
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
    readyForEnterpriseContractAudit: true,
    readyForBuilderImplementationPlan: readinessDecision.readyForBuilderImplementationPlan,
    readyForBuilderImplementation: false,
    readyForRuntimeImplementation: false,
    readyForPreviewMount: false,
    readyForProductExposure: false,
    metadataOnly: true,
  };

  const verification = verifyBridgeDecisionCoreEnvelopeBuilderContract({ contract: base });
  const diagnostics = createBuilderContractDiagnostics({ verification });

  return Object.freeze(deepFreeze({ ...base, verification, diagnostics }));
}

export default createStudioBridgeDecisionCoreEnvelopeBuilderContract;

import { verifyBuilderCompatibility } from './verifyBuilderCompatibility.js';
import { PIPELINE_STAGES } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Readiness + manual gate for the implemented Builder. The builder is implemented; consumer runtime and preview
 * runtime are NOT. identityVerification here means builder source/core/digest verification (producer-side), and the
 * Core Envelope invariant identityVerified stays false. Ready for the enterprise builder audit; execution of any
 * downstream (consumer runtime, preview mount, product exposure) is NOT self-authorized.
 */
export const READINESS_READY = 'studio_bridge_decision_core_envelope_builder_ready_for_enterprise_audit';
export const READINESS_NEEDS_FIX = 'studio_bridge_decision_core_envelope_builder_needs_builder_fix';

export function createBuilderReadiness() {
  const compat = verifyBuilderCompatibility();
  const ready = compat.ok === true;
  return deepFreeze({
    kind: 'builder-readiness',
    // ---- Implemented. ----
    builderImplemented: true, builderFactoryImplemented: true, buildImplemented: true,
    safeNormalizationImplemented: true, sourceShapeValidationImplemented: true, sourceEligibilityValidationImplemented: true,
    sourceVersionValidationImplemented: true, sourceSecurityBoundaryImplemented: true, targetDescriptorValidationImplemented: true,
    coreAllowlistResolutionImplemented: true, coreExtractionImplemented: true, coreValidationImplemented: true,
    digestRecomputeImplemented: true, sameDecisionAtomicityImplemented: true, envelopeConstructionImplemented: true,
    envelopeValidationImplemented: true, builderDecisionImplemented: true, failureContainmentImplemented: true,
    resourceLimitsImplemented: true, extensionsPrototypeProtectionImplemented: true, replayIdempotencyImplemented: true,
    manifestImplemented: true, compatibilityVerifierImplemented: true, identityVerificationImplemented: true,
    // ---- Pipeline execution facts (proved by the executor + its dedicated scenarios). ----
    pipelineImplemented: true,
    all23StagesImplemented: PIPELINE_STAGES.length === 23,
    all23StagesExecuted: true,
    boundaryStages17To23Executed: true,
    firstBlockerStageAtomic: true,
    issueStageAllowlistClosed: true,
    exactTargetDescriptorComparison: true,
    exactVersionTupleComparison: true,
    identityVerificationMeaning: 'builder_source_core_digest_verification',
    coreEnvelopeIdentityVerifiedInvariant: false,
    // ---- NOT implemented. ----
    consumerRuntimeImplemented: false, previewRuntimeImplemented: false, previewMounted: false, appTouched: false,
    routeCreated: false, menuCreated: false, persistenceImplemented: false, backendAccessed: false, prismaAccessed: false,
    networkUsed: false, realDataRead: false, moduleGenerated: false, certificationPerformed: false, productExposed: false,
    productionAccessed: false,
    // ---- Readiness gates. ----
    compatibilityOk: compat.ok,
    compatibilityBlockerCount: compat.blockerCount,
    readyForEnterpriseBuilderAudit: ready,
    readyForConsumerRuntimeImplementation: false, readyForPreviewMount: false, readyForProductExposure: false,
    // FAIL-CLOSED: the readiness STRING is derived from the verifier, never asserted unconditionally. If any
    // compatibility comparison fails, this reads `..._needs_builder_fix` — the audit-ready wording is impossible.
    readiness: ready ? READINESS_READY : READINESS_NEEDS_FIX,
  });
}
export const BUILDER_MANUAL_GATE = deepFreeze({
  kind: 'builder-manual-gate',
  manualGateRequired: true,
  sourceCheckpoint: 'pr_494_post_merge_builder_implementation_plan_audit',
  sourceDecision: 'POST_MERGE_REVALIDATION_PASS',
  sourceRecommendation: 'READY_FOR_BRIDGE_DECISION_CORE_ENVELOPE_BUILDER_IMPLEMENTATION',
  selectedArchitecture: 'ARCHITECTURE_1',
  currentSliceAuthorization: 'bridge_decision_core_envelope_builder_implementation_only',
  authorizesBuilderImplementation: true,
  authorizesConsumerRuntime: false,
  authorizesPreviewRuntime: false,
  authorizesPreviewMount: false,
  authorizesUi: false,
  authorizesAppTouch: false,
  authorizesPersistence: false,
  authorizesBackend: false,
  authorizesPrisma: false,
  authorizesModuleGeneration: false,
  authorizesCertification: false,
  authorizesProductExposure: false,
  authorizesCoreEnvelopeAmendment: false,
});
export default createBuilderReadiness;

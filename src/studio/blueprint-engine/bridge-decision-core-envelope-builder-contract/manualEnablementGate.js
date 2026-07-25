import { SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, SELECTED_ARCHITECTURE, CURRENT_SLICE_AUTHORIZATION } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Manual gate (declared). This slice authorizes ONLY the verification-state classification CORRECTION of the builder
 * CONTRACT. The contract may be TECHNICALLY ready for the Builder Implementation Plan (readyForBuilderImplementationPlan
 * = true) while this gate still does NOT authorize executing that plan — external authorization only follows the
 * post-merge audit of this correction. No Core Envelope amendment is authorized (none is required). Every
 * plan/implementation/runtime/UI/backend authorization stays false.
 */
export const MANUAL_ENABLEMENT_GATE = deepFreeze({
  kind: 'builder-manual-enablement-gate',
  manualGateRequired: true,
  sourceCheckpoint: SOURCE_CHECKPOINT,
  sourceDecision: SOURCE_DECISION,
  sourceRecommendation: SOURCE_RECOMMENDATION,
  selectedArchitecture: SELECTED_ARCHITECTURE,
  currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
  authorizesBuilderContract: true,
  authorizesVerificationStateCorrection: true,
  authorizesBuilderImplementationPlan: false,
  authorizesBuilderImplementation: false,
  authorizesRuntimeImplementation: false,
  authorizesCoreEnvelopeAmendment: false,
  authorizesPreviewMount: false,
  authorizesUi: false,
  authorizesAppTouch: false,
  authorizesPersistence: false,
  authorizesBackend: false,
  authorizesPrisma: false,
  authorizesModuleGeneration: false,
  authorizesCertification: false,
  authorizesProductExposure: false,
});
export default MANUAL_ENABLEMENT_GATE;

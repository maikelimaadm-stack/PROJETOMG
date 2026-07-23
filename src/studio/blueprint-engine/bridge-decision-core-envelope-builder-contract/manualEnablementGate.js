import { SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, SELECTED_ARCHITECTURE, CURRENT_SLICE_AUTHORIZATION } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Manual gate (declared). Authorizes ONLY this builder CONTRACT; builder-plan/implementation/runtime stay false. */
export const MANUAL_ENABLEMENT_GATE = deepFreeze({
  kind: 'builder-manual-enablement-gate',
  manualGateRequired: true,
  sourceCheckpoint: SOURCE_CHECKPOINT,
  sourceDecision: SOURCE_DECISION,
  sourceRecommendation: SOURCE_RECOMMENDATION,
  selectedArchitecture: SELECTED_ARCHITECTURE,
  currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
  authorizesBuilderContract: true,
  authorizesBuilderImplementationPlan: false,
  authorizesBuilderImplementation: false,
  authorizesRuntimeImplementation: false,
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

import { SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT } from './envelopeContractConfig.js';
import { deepFreeze } from './deepFreeze.js';
export const MANUAL_CHECKPOINT_CONTRACT = deepFreeze({
  kind: 'envelope-manual-checkpoint-contract',
  manualGateRequired: true, sourceCheckpoint: SOURCE_CHECKPOINT, sourceDecision: SOURCE_DECISION,
  sourceRecommendation: SOURCE_RECOMMENDATION, currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
  requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
  authorizesEnvelopeContract: true, authorizesImplementationPlan: false, authorizesEnvelopeBuilder: false,
  authorizesConsumerRuntime: false, authorizesPreviewMount: false, authorizesUi: false, authorizesAppTouch: false,
  authorizesPersistence: false, authorizesBackend: false, authorizesPrisma: false, authorizesModuleGeneration: false,
  authorizesCertification: false, authorizesProductExposure: false,
});
export default MANUAL_CHECKPOINT_CONTRACT;

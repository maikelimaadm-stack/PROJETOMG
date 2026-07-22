import { SOURCE_CHECKPOINT, SOURCE_DECISION, CURRENT_SLICE_AUTHORIZATION, REQUIRED_FUTURE_CHECKPOINT } from './contractRuntimeConfig.js';
import { deepFreeze } from './deepFreeze.js';
export const MANUAL_CHECKPOINT_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-manual-checkpoint-contract',
  manualGateRequired: true, sourceCheckpoint: SOURCE_CHECKPOINT, sourceDecision: SOURCE_DECISION,
  currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION, requiredFutureCheckpoint: REQUIRED_FUTURE_CHECKPOINT,
  authorizesContractDefinition: true, authorizesImplementationPlan: false, authorizesRuntimeImplementation: false,
  authorizesPreviewMount: false, authorizesUi: false, authorizesAppTouch: false, authorizesRouteMenu: false,
  authorizesPersistence: false, authorizesBackend: false, authorizesPrisma: false, authorizesModuleGeneration: false,
  authorizesCertification: false, authorizesProductExposure: false, authorizesRealData: false,
  authorizesPermissionTenancyIntegration: false,
});
export default MANUAL_CHECKPOINT_CONTRACT;

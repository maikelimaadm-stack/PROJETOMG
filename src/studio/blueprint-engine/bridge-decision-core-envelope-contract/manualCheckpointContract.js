import { SOURCE_CHECKPOINT, SOURCE_DECISION, SELECTED_ARCHITECTURE, CURRENT_SLICE_AUTHORIZATION } from './coreEnvelopeConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Manual gate (declared). Authorizes ONLY this contract; every builder/runtime/mount/product stays false. */
export const MANUAL_CHECKPOINT_CONTRACT = deepFreeze({
  kind: 'core-envelope-manual-checkpoint-contract',
  manualGateRequired: true,
  sourceCheckpoint: SOURCE_CHECKPOINT,
  sourceDecision: SOURCE_DECISION,
  selectedArchitecture: SELECTED_ARCHITECTURE,
  currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
  authorizesCoreEnvelopeBuilder: false,
  authorizesConsumerRuntime: false,
  authorizesDigestRecomputeRuntime: false,
  authorizesImplementationPlanAlignment: false,
  authorizesPreviewMount: false,
  authorizesModuleGeneration: false,
  authorizesCertification: false,
  authorizesProductExposure: false,
});
export default MANUAL_CHECKPOINT_CONTRACT;

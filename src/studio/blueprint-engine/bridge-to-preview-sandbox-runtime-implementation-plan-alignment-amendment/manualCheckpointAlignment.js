import { SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, SELECTED_ARCHITECTURE, CURRENT_SLICE_AUTHORIZATION } from './amendmentConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Manual checkpoint alignment. Authorizes ONLY this plan alignment; CHECKPOINT_02 stays blocked. */
export const MANUAL_CHECKPOINT_ALIGNMENT = deepFreeze({
  kind: 'manual-checkpoint-alignment',
  manualGateRequired: true,
  sourceCheckpoint: SOURCE_CHECKPOINT,
  sourceDecision: SOURCE_DECISION,
  sourceRecommendation: SOURCE_RECOMMENDATION,
  selectedArchitecture: SELECTED_ARCHITECTURE,
  currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
  checkpoints: deepFreeze([
    deepFreeze({ checkpointId: 'CHECKPOINT_01_PLAN_ENTERPRISE_AUDIT', state: 'completed' }),
    deepFreeze({ checkpointId: 'CHECKPOINT_01_ALIGNMENT_ENTERPRISE_AUDIT', state: 'pending' }),
    deepFreeze({ checkpointId: 'CHECKPOINT_02_PRE_RUNTIME_IMPLEMENTATION_AUTHORIZATION', state: 'blocked' }),
  ]),
  checkpoint02Requires: deepFreeze([
    'alignment amendment merged and audited', 'B-RECOMPUTE-INPUT resolved_at_plan_level',
    'Core Envelope Builder Contract merged and audited', 'no remaining blocker',
  ]),
  authorizesPlanAlignment: true,
  authorizesBuilderContract: false,
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
export default MANUAL_CHECKPOINT_ALIGNMENT;

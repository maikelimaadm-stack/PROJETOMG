import {
  SOURCE_CHECKPOINT, SOURCE_DECISION, SOURCE_RECOMMENDATION, SELECTED_ARCHITECTURE, CURRENT_SLICE_AUTHORIZATION,
} from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Manual checkpoints + manual enablement gate. This slice authorizes ONLY the implementation PLAN, not execution. */
export const MANUAL_CHECKPOINTS = deepFreeze({
  kind: 'builder-implementation-plan-manual-checkpoints',
  checkpoints: deepFreeze([
    deepFreeze({ id: 'CHECKPOINT_01_BUILDER_CONTRACT_ENTERPRISE_AUDIT', state: 'completed' }),
    deepFreeze({ id: 'CHECKPOINT_02_BUILDER_IMPLEMENTATION_PLAN_ENTERPRISE_AUDIT', state: 'pending' }),
    deepFreeze({ id: 'CHECKPOINT_03_PRE_BUILDER_IMPLEMENTATION_AUTHORIZATION', state: 'blocked' }),
    deepFreeze({ id: 'CHECKPOINT_04_PRE_CONSUMER_RUNTIME_AUTHORIZATION', state: 'blocked' }),
  ]),
});
export const MANUAL_ENABLEMENT_GATE = deepFreeze({
  kind: 'builder-implementation-plan-manual-enablement-gate',
  manualGateRequired: true,
  sourceCheckpoint: SOURCE_CHECKPOINT,
  sourceDecision: SOURCE_DECISION,
  sourceRecommendation: SOURCE_RECOMMENDATION,
  selectedArchitecture: SELECTED_ARCHITECTURE,
  currentSliceAuthorization: CURRENT_SLICE_AUTHORIZATION,
  authorizesBuilderImplementationPlan: true,
  authorizesBuilderImplementation: false,
  authorizesConsumerRuntime: false,
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

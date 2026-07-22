import { deepFreeze } from './deepFreeze.js';

/**
 * MANUAL CHECKPOINT PLAN — the human gates between plan, runtime implementation, post-merge audit and preview
 * mount. Declaration only. In THIS slice only CHECKPOINT_01 is authorized; nothing downstream is authorized.
 */
const C = (checkpointId, order, title, gates) => deepFreeze({
  checkpointId, order, title, manualGateRequired: true, gates: Object.freeze([...gates]),
});

export const MANUAL_CHECKPOINT_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-manual-checkpoint-plan',
  checkpoints: deepFreeze([
    C('CHECKPOINT_01_PLAN_ENTERPRISE_AUDIT', 1, 'Plan enterprise audit', ['plan reviewed', 'B-RECOMPUTE-INPUT resolved before runtime']),
    C('CHECKPOINT_02_PRE_RUNTIME_IMPLEMENTATION_AUTHORIZATION', 2, 'Pre-runtime implementation authorization', ['plan merged', 'B-RECOMPUTE-INPUT closed by contract amendment']),
    C('CHECKPOINT_03_RUNTIME_IMPLEMENTATION_POST_MERGE_AUDIT', 3, 'Runtime implementation post-merge audit', ['runtime merged', 'deep enterprise audit']),
    C('CHECKPOINT_04_PRE_PREVIEW_MOUNT_AUTHORIZATION', 4, 'Pre-preview mount authorization', ['runtime audited', 'permission/tenancy foundation present']),
  ]),
  onlyCheckpoint01Authorized: true,
  runtimeImplementationAuthorized: false,
  previewMountAuthorized: false,
  productExposureAuthorized: false,
  // The manual gate must NOT authorize any real downstream action from within the plan.
  authorizesConsumerRuntime: false,
  authorizesEnvelopeBuilder: false,
  authorizesImplementationRuntime: false,
  authorizesPreviewMount: false,
  authorizesModuleGeneration: false,
  authorizesCertification: false,
  authorizesProductExposure: false,
});

export default MANUAL_CHECKPOINT_PLAN;

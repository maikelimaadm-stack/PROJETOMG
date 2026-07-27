import {
  BUILDER_PIPELINE_STAGES, BUILDER_ISSUE_CODES, FAILURE_CONTAINMENT_CONTRACT, RESOURCE_LIMITS_CONTRACT,
  RESOURCE_DIMENSION_NAMES, EXTENSIBILITY_CONTRACT, REPLAY_IDEMPOTENCY_CONTRACT,
} from '../bridge-decision-core-envelope-builder-contract/index.js';
import { deepFreeze } from './deepFreeze.js';

/** Pipeline execution plan — reflects the real 23 stages in exact order. */
export const PIPELINE_EXECUTION_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-pipeline-execution',
  stages: deepFreeze([...BUILDER_PIPELINE_STAGES]),
  stageCount: BUILDER_PIPELINE_STAGES.length,
  deterministicOrder: true,
  firstBlockerStopsPipeline: true,
  skipRemainingStagesOnBlocker: true,
  atomicCommitPoint: 'after all validations pass, before emission',
  envelopeEmissionPoint: 'only after every stage passes',
  pipelineImplemented: false,
});
/** Issue + failure containment plan — real issue codes; fail-closed; no leaks. */
export const ISSUE_FAILURE_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-issue-failure',
  issueCodes: deepFreeze([...BUILDER_ISSUE_CODES]),
  issueCodeCount: BUILDER_ISSUE_CODES.length,
  atomicBuilderDecisionRequired: FAILURE_CONTAINMENT_CONTRACT.atomicBuilderDecisionRequired === true,
  partialCoreForbidden: FAILURE_CONTAINMENT_CONTRACT.partialCoreAllowed === false,
  partialEnvelopeForbidden: FAILURE_CONTAINMENT_CONTRACT.partialEnvelopeAllowed === false,
  rollbackByNonEmission: FAILURE_CONTAINMENT_CONTRACT.rollbackByNonEmission === true,
  emergencyRejectionRequired: FAILURE_CONTAINMENT_CONTRACT.emergencyRejectionRequired === true,
  noLeaks: FAILURE_CONTAINMENT_CONTRACT.stackLeakAllowed === false && FAILURE_CONTAINMENT_CONTRACT.secretLeakAllowed === false,
  failureImplemented: false,
});
/** Resource limits plan — boundary tests limit-1/limit/limit+1 per real dimension. */
export const RESOURCE_LIMITS_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-resource-limits',
  dimensions: deepFreeze([...RESOURCE_DIMENSION_NAMES]),
  dimensionCount: RESOURCE_DIMENSION_NAMES.length,
  boundaryTestMatrix: deepFreeze(['limit-1 accepted', 'limit accepted', 'limit+1 rejected']),
  silentTruncationForbidden: RESOURCE_LIMITS_CONTRACT.silentTruncationAllowed === false,
  partialOutputForbidden: RESOURCE_LIMITS_CONTRACT.partialOutputAllowed === false,
  unknownDimensionRejected: RESOURCE_LIMITS_CONTRACT.unknownDimensionRejected === true,
  limitsImplemented: false,
});
/** Extensions/prototype + replay/idempotency plan. */
export const EXTENSIONS_REPLAY_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-extensions-replay',
  coreExtensionsForbidden: EXTENSIBILITY_CONTRACT.coreExtensionsAllowed === false,
  envelopeExtensionsForbidden: EXTENSIBILITY_CONTRACT.envelopeExtensionsAllowed === false,
  digestCoreVersionOverrideForbidden: EXTENSIBILITY_CONTRACT.digestOverrideRejected === true && EXTENSIBILITY_CONTRACT.coreOverrideRejected === true && EXTENSIBILITY_CONTRACT.versionOverrideRejected === true,
  prototypePollutionForbidden: EXTENSIBILITY_CONTRACT.prototypePollutionKeysRejected === true,
  crossInstanceDeterminismRequired: REPLAY_IDEMPOTENCY_CONTRACT.crossInstanceDeterminismRequired === true,
  noClockRandomLocaleTimezone: REPLAY_IDEMPOTENCY_CONTRACT.randomnessAllowed === false && REPLAY_IDEMPOTENCY_CONTRACT.ambientClockAllowed === false,
  replayImplemented: false,
});
export default PIPELINE_EXECUTION_PLAN;

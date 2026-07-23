import { deepFreeze } from './deepFreeze.js';
/** Replay / idempotency / determinism (declared). */
export const REPLAY_IDEMPOTENCY_CONTRACT = deepFreeze({
  kind: 'builder-replay-idempotency-contract',
  sameSourceDecisionSameConfigSameBuilderDecision: true,
  sameSourceDecisionProducesSameCore: true,
  sameCoreProducesSameDigest: true,
  sameValidSourceProducesSameEnvelope: true,
  sameInvalidSourceProducesSameIssues: true,
  crossInstanceDeterminismRequired: true,
  ambientClockAllowed: false, randomnessAllowed: false, localeDependencyAllowed: false,
  timezoneDependencyAllowed: false, globalMutableStateAllowed: false,
  replayImplemented: false, builderDecisionCreated: false,
});
export default REPLAY_IDEMPOTENCY_CONTRACT;

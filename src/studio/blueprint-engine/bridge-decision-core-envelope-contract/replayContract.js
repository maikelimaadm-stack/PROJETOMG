import { deepFreeze } from './deepFreeze.js';
/** Replay/determinism (declared). Same decision -> same core -> same envelope -> same digest, cross-instance. */
export const REPLAY_CONTRACT = deepFreeze({
  kind: 'core-envelope-replay-contract',
  sameDecisionProducesSameCore: true,
  sameCoreAndDigestProduceSameEnvelope: true,
  sameInvalidInputProducesSameIssues: true,
  crossInstanceDeterminismRequired: true,
  ambientClockAllowed: false, randomnessAllowed: false, localeDependencyAllowed: false,
  timezoneDependencyAllowed: false, globalMutableStateAllowed: false,
  replayImplemented: false,
});
export default REPLAY_CONTRACT;

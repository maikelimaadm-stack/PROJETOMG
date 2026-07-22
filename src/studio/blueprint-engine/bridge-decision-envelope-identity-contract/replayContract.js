import { deepFreeze } from './deepFreeze.js';
export const REPLAY_CONTRACT = deepFreeze({
  kind: 'envelope-replay-contract',
  sameDecisionProducesSameEnvelope: true, sameDigestAndDescriptorProducesSameEnvelope: true,
  crossInstanceDeterminismRequired: true, sameIssuesOrderingRequired: true, replaySideEffectsAllowed: false,
  ambientClockAllowed: false, randomnessAllowed: false, localeDependencyAllowed: false, timezoneDependencyAllowed: false,
  replayImplemented: false,
});
export default REPLAY_CONTRACT;

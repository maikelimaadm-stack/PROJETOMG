import { deepFreeze } from './deepFreeze.js';
export const REPLAY_CONTRACT = deepFreeze({
  kind: 'bridge-to-sandbox-replay-contract',
  sameSourcePlusSameConfigProducesSameDecision: true, sameIssuesOrderingRequired: true,
  sameSandboxDescriptorRequired: true, sameConsumerDecisionDigestRequired: true, replaySideEffectsAllowed: false,
  globalMutableStateAllowed: false, ambientClockAllowed: false, randomnessAllowed: false,
  localeDependencyAllowed: false, timezoneDependencyAllowed: false,
  replayImplemented: false,
});
export default REPLAY_CONTRACT;

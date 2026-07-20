import { deepFreeze } from './deepFreeze.js';

/** REPLAY / IDEMPOTENCY contract — same config+source+expectedDraftId yields the same decision. Pure. */
export function createBridgeReplayContract() {
  return deepFreeze({
    kind: 'bridge-replay-contract',
    idempotent: true,
    replaySideEffectsAllowed: false,
    globalCounters: false,
    ambientState: false,
    sameInputSameDecision: true,
    sameInputSameIssues: true,
    sameInputSameTargetDescriptor: true,
    sameInputSameDecisionDigest: true,
    byteEquivalentReplay: true,
  });
}

export default createBridgeReplayContract;

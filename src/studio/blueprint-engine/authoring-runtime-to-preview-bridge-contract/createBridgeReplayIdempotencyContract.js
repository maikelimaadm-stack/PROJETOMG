import { bridgeDigest } from './bridgeContractConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Declares the REPLAY / IDEMPOTENCY contract. The same source handoff must yield the same bridge
 * decision + target descriptor + digest, with no replay side effects. Execution is a future slice.
 * Metadata only. @returns {Object}
 */
export function createBridgeReplayIdempotencyContract() {
  const core = {
    kind: 'bridge-replay-idempotency-contract',
    sameSourceHandoffProducesSameBridgeDecision: true,
    sameSourceHandoffProducesSameTargetDescriptor: true,
    bridgeDecisionDigestDeterministic: true,
    idempotentByContract: true,
    replaySideEffectsAllowed: false,
    bridgeExecutionImplemented: false,
  };
  return safeCloneGenericModel({ ...core, replayIdempotencyContractDigest: bridgeDigest(core) });
}

export default createBridgeReplayIdempotencyContract;

import { bridgePlanDigest } from './bridgeImplementationPlanConfig.js';
import { safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * REPLAY / IDEMPOTENCY PLAN — plans that the same source handoff yields the same bridge decision, target
 * descriptor and digest, with no replay side effects. Not implemented here. Metadata only. @returns {Object}
 */
export function createReplayIdempotencyPlan() {
  const core = {
    kind: 'bridge-replay-idempotency-plan',
    replayIdempotencyPlanned: true,
    replayIdempotencyImplemented: false,
    sameSourceHandoffProducesSameBridgeDecision: true,
    sameSourceHandoffProducesSameTargetDescriptor: true,
    bridgeDecisionDigestDeterministic: true,
    idempotentByContract: true,
    replaySideEffectsAllowed: false,
  };
  return safeCloneGenericModel({ ...core, replayIdempotencyPlanDigest: bridgePlanDigest(core) });
}

export default createReplayIdempotencyPlan;

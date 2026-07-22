import { CONSUMER_DECISION_STATUSES } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * CONSUMER DECISION PLAN — the FUTURE deterministic consumer decision. Declaration only; NO decision is produced.
 * The consumerDecisionDigest is an internal deterministic identity (FNV-1a) — NOT a cryptographic-security claim.
 */
export const CONSUMER_DECISION_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-consumer-decision-plan',
  decisionFields: deepFreeze([
    'ok', 'status', 'envelopeAccepted', 'identityVerified', 'sandboxDescriptorCreated', 'sandboxDescriptor',
    'issues', 'sourceMutated', 'sideEffects', 'rollbackByNonConsumption', 'consumerDecisionDigest',
  ]),
  statuses: [...CONSUMER_DECISION_STATUSES],
  canonicalSerializer: 'stableSerialize (key-sorted, deterministic) — read-only reuse of Authoring Runtime helper',
  digestHelper: 'createDeterministicDigest (FNV-1a) — internal identity only',
  decisionPreimage: 'the ordered decision fields minus consumerDecisionDigest',
  issueOrdering: 'stable: by stage order then issue code',
  successStatus: 'sandbox_candidate_accepted',
  failureStatus: 'sandbox_candidate_rejected',
  cryptographicSecurityClaimed: false,
  atomicDecision: true,
  consumerDecisionImplemented: false,
});

export default CONSUMER_DECISION_PLAN;

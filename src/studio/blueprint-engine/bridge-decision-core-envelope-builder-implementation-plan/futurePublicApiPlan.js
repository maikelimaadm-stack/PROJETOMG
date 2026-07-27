import { FUTURE_BUILDER_FACTORY, FUTURE_BUILDER_DECISION_STATUSES } from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * PLANNED future public API. Declared, NOT implemented. The future builder decision carries identityVerified OUTSIDE
 * the envelope (producer-side integrity), never mutating the immutable Core Envelope v2.
 */
export const FUTURE_PUBLIC_API_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-future-public-api',
  factorySignature: `${FUTURE_BUILDER_FACTORY}(config) -> { build(bridgeDecision) }`,
  factoryName: FUTURE_BUILDER_FACTORY,
  buildInput: 'bridgeDecision (a real, complete, hardened bridge decision)',
  builderDecisionFields: deepFreeze([
    'ok', 'status', 'sourceAccepted', 'coreExtracted', 'identityVerified', 'coreEnvelopeCreated', 'coreEnvelope',
    'issues', 'sourceMutated', 'sideEffects', 'rollbackByNonEmission', 'builderDecisionDigest',
  ]),
  statuses: deepFreeze([...FUTURE_BUILDER_DECISION_STATUSES]),
  // The builder decision's identityVerified is the PRODUCER integrity result (true on success), outside the envelope.
  builderDecisionIdentityVerifiedIsProducerSide: true,
  envelopeIdentityVerifiedAlwaysFalse: true,
  // Nothing implemented in this slice.
  builderFactoryImplemented: false, buildImplemented: false, coreExtractionImplemented: false,
  digestRecomputeImplemented: false, envelopeConstructionImplemented: false,
});
export default FUTURE_PUBLIC_API_PLAN;

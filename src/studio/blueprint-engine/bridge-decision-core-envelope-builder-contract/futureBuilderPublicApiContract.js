import { FUTURE_BUILDER_FACTORY, BUILDER_DECISION_STATUSES } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/** Future builder public API as METADATA ONLY. Nothing implemented. */
export const FUTURE_BUILDER_PUBLIC_API_CONTRACT = deepFreeze({
  kind: 'builder-future-public-api-contract',
  factorySignature: `${FUTURE_BUILDER_FACTORY}(config) -> { build(bridgeDecision) }`,
  factoryName: FUTURE_BUILDER_FACTORY,
  buildInput: 'bridgeDecision (complete real hardened decision)',
  buildResultFields: deepFreeze([
    'ok', 'status', 'sourceAccepted', 'coreExtracted', 'identityVerified', 'coreEnvelopeCreated', 'coreEnvelope',
    'issues', 'sourceMutated', 'sideEffects', 'rollbackByNonEmission', 'builderDecisionDigest',
  ]),
  statuses: [...BUILDER_DECISION_STATUSES],
  builderFactoryImplemented: false, buildImplemented: false, coreExtractionImplemented: false,
  digestRecomputeImplemented: false, envelopeConstructionImplemented: false,
});
export default FUTURE_BUILDER_PUBLIC_API_CONTRACT;

import { SOURCE_TRACEABILITY } from './sourceTraceability.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * Identity lifecycle plan (ARCHITECTURE 1, final). identityVerified is consumer-owned. Builder verification is a
 * producer-side integrity gate recorded in the builder decision; the immutable Core Envelope v2 keeps
 * identityVerified=false ("awaiting consumer verification"); the consumer independently re-verifies and records its
 * own consumerDecision.identityVerified=true. Double verification is intentional defense-in-depth. No amendment.
 */
export const IDENTITY_LIFECYCLE_PLAN = deepFreeze({
  kind: 'builder-implementation-plan-identity-lifecycle',
  identityVerifiedSemanticOwner: 'consumer_runtime',
  selectedArchitecture: 'ARCHITECTURE_1',
  architectureOneFinal: true,
  // Required lifecycle facts the future builder MUST honor.
  builderDecisionIdentityVerifiedTrueOnSuccess: true,
  coreEnvelopeIdentityVerifiedAlwaysFalse: true,
  consumerDecisionIdentityVerifiedTrueOnlyAfterIndependentReverification: true,
  consumerDoesNotMutateEnvelope: true,
  doubleVerificationRequired: true,
  coreEnvelopeVerificationStateAmendmentRequired: false,
  // Envelope invariant reflected from the real upstream (must stay false).
  envelopeInvariantIdentityVerified: SOURCE_TRACEABILITY.envelopeInvariantIdentityVerified,
  // Prohibited designs.
  prohibited: deepFreeze([
    'envelope.identityVerified=true',
    'mutating the immutable envelope',
    'builder assuming/claiming consumer verification',
    'consumer trusting only the builder decision without independent reverification',
  ]),
  identityVerificationImplemented: false,
});
export default IDENTITY_LIFECYCLE_PLAN;

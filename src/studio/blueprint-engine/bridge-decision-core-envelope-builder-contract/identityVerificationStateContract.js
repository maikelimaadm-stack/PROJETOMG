import { OUTPUT_CORE_ENVELOPE_INVARIANTS } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * IDENTITY VERIFICATION STATE — corrected semantic classification (§15, post-#492 audit).
 *
 * The merged Core Envelope v2 groups `identityVerified` inside CORE_ENVELOPE_SECURITY_FIELDS, beside `coreConsumed`,
 * `consumerRuntimeInvoked`, `previewMounted` and `productExposed` — every one of which is a CONSUMER-runtime lifecycle
 * flag that is false at envelope-emission time and flips true only when the CONSUMER acts. The consumer decision shape
 * (bridge-to-preview-sandbox-runtime-implementation-plan) carries its OWN `identityVerified`. Therefore the semantic
 * OWNER of `identityVerified` is the CONSUMER RUNTIME, not the builder.
 *
 * Builder verification (recompute-and-compare of the digest) is a PRODUCER-side integrity gate — a DIFFERENT concern
 * from consumer identity verification. Its result is recorded in the BUILDER DECISION (builderDecision.identityVerified
 * = true), OUTSIDE the immutable envelope. The envelope, being pre-consumer, correctly and immutably keeps
 * `identityVerified:false`, which means "not yet verified by the consumer". The consumer later recomputes the digest
 * INDEPENDENTLY and records its own consumerDecision.identityVerified = true.
 *
 * Because builder verification ≠ consumer identity verification, the builder never needs the ENVELOPE to advertise
 * verification. This is ARCHITECTURE 1 and it is FINAL — no Core Envelope Verification State Amendment is required.
 * Consequently B-CORE-ENVELOPE-VERIFICATION-STATE is NOT_A_BLOCKER (it was previously over-declared as OPEN).
 */
const envelopeInvariantIdentityVerified = OUTPUT_CORE_ENVELOPE_INVARIANTS.identityVerified; // false (live-read)
export const IDENTITY_VERIFICATION_STATE_CONTRACT = deepFreeze({
  kind: 'builder-identity-verification-state-contract',
  // ---- Semantic ownership (corrected). ----
  identityVerifiedSemanticOwner: 'consumer_runtime',
  selectedArchitecture: 'ARCHITECTURE_1',
  ARCHITECTURE_1_IS_FINAL: true,
  optionBWasProvisional: false,
  // ---- Envelope invariant (unchanged; correct as a consumer-lifecycle flag). ----
  coreEnvelopeCurrentInvariantIdentityVerified: envelopeInvariantIdentityVerified, // false
  coreEnvelopeInvariantIsAbsoluteInstanceInvariant: true,
  envelopeIdentityVerifiedRemainsFalse: true,
  envelopeFalseMeansAwaitingConsumerVerification: true,
  envelopeIsImmutable: true,
  envelopeMutatedByConsumer: false,
  // ---- Builder verification lives OUTSIDE the envelope, in the builder decision. ----
  builderPerformsRecomputeAndCompare: true,
  builderVerificationRecordedInBuilderDecision: true,
  builderResultCarriesVerifiedOutsideEnvelope: true,
  builderDesiredEnvelopeIdentityVerifiedTrue: false, // corrected: builder does NOT need the envelope to advertise verification
  // ---- Consumer performs its own independent verification. ----
  consumerVerificationRecordedInConsumerDecision: true,
  consumerPerformsIndependentVerification: true,
  // ---- Classification (corrected): NOT a blocker; no amendment. ----
  verificationStateClassification: 'NOT_A_BLOCKER',
  bCoreEnvelopeVerificationStateOpen: false,
  coreEnvelopeVerificationStateAmendmentRequired: false,
  requiredAmendment: null,
  silentOverrideAllowed: false,
  blocksBuilderImplementationPlan: false,
  identityVerificationImplemented: false,
  // ---- Architectures considered (Architecture 1 selected as FINAL). ----
  options: deepFreeze([
    deepFreeze({ option: 'ARCHITECTURE_1', selected: true, final: true, title: 'identityVerified is consumer-owned; builder verification recorded in the builder decision; immutable envelope stays false (awaiting consumer); consumer verifies independently', requiresCoreEnvelopeAmendment: false }),
    deepFreeze({ option: 'ARCHITECTURE_2', selected: false, title: 'lifecycle amendment: builder-emitted envelope could advertise identityVerified=true or a verified envelope version/state', requiresCoreEnvelopeAmendment: true }),
    deepFreeze({ option: 'ARCHITECTURE_3', selected: false, title: 'remove/rename identityVerified in a future envelope version', requiresCoreEnvelopeAmendment: true }),
  ]),
});
export default IDENTITY_VERIFICATION_STATE_CONTRACT;

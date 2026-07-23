import { OUTPUT_CORE_ENVELOPE_INVARIANTS } from './contractConfig.js';
import { deepFreeze } from './deepFreeze.js';
/**
 * IDENTITY VERIFICATION STATE analysis (§15) — the CRITICAL point.
 *
 * The merged Core Envelope v2 contract fixes `identityVerified:false` as an ABSOLUTE instance invariant (it is a
 * consumer-runtime security flag). The builder DOES perform recompute-and-compare as a producer-side integrity
 * gate, so it would logically want to advertise verification. But it CANNOT set the envelope's `identityVerified`
 * to true without conflicting with the merged invariant — and it must NOT silently override it. This is a real
 * open blocker: B-CORE-ENVELOPE-VERIFICATION-STATE. The contract selects the least-invasive resolution (Option B:
 * the builder RESULT carries identityVerified/builder-verified OUTSIDE the envelope; the envelope stays false),
 * and records that any design wanting the ENVELOPE itself to advertise verification requires a future Core
 * Envelope Verification State Amendment (Option A or C). Runtime/Builder-Implementation-Plan stay blocked.
 */
const envelopeInvariantIdentityVerified = OUTPUT_CORE_ENVELOPE_INVARIANTS.identityVerified; // false (live-read)
export const IDENTITY_VERIFICATION_STATE_CONTRACT = deepFreeze({
  kind: 'builder-identity-verification-state-contract',
  coreEnvelopeCurrentInvariantIdentityVerified: envelopeInvariantIdentityVerified, // false
  coreEnvelopeInvariantIsAbsoluteInstanceInvariant: true,
  builderPerformsRecomputeAndCompare: true,
  builderDesiredEnvelopeIdentityVerifiedTrue: true,
  compatibleWithMergedV2Invariant: envelopeInvariantIdentityVerified === true, // false -> conflict
  silentOverrideAllowed: false,
  options: deepFreeze([
    deepFreeze({ option: 'A', selected: false, title: 'v2 distinguishes contract-definition default false from builder-emitted verified true', requiresCoreEnvelopeAmendment: true }),
    deepFreeze({ option: 'B', selected: true, title: 'builder RESULT carries identityVerified true OUTSIDE the envelope; envelope stays false', requiresCoreEnvelopeAmendment: false }),
    deepFreeze({ option: 'C', selected: false, title: 'new envelope version/state explicitly verified', requiresCoreEnvelopeAmendment: true }),
  ]),
  selectedOption: 'B',
  builderResultCarriesVerifiedOutsideEnvelope: true,
  envelopeIdentityVerifiedRemainsFalse: true,
  // Because the builder cannot make the ENVELOPE advertise verification without an amendment, the state blocker
  // is OPEN. Option B is a viable interim, but the enterprise resolution (envelope-advertised verification) needs
  // a Core Envelope Verification State Amendment.
  bCoreEnvelopeVerificationStateOpen: true,
  requiredAmendment: 'Core Envelope Verification State Amendment',
  blocksBuilderImplementationPlan: true,
  identityVerificationImplemented: false,
});
export default IDENTITY_VERIFICATION_STATE_CONTRACT;

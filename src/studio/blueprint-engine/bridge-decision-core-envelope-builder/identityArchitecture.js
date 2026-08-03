import { IDENTITY_VERIFICATION_STATE_CONTRACT } from '../bridge-decision-core-envelope-builder-contract/index.js';
import { ENVELOPE_INVARIANTS } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * The identity architecture this builder implements, DERIVED from the upstream contract — the owner, the selected
 * architecture and its finality are never asserted locally. ARCHITECTURE 1: `identityVerified` is consumer-owned;
 * the builder records its own producer-side verification OUTSIDE the envelope, and the immutable envelope keeps
 * `identityVerified:false` awaiting independent consumer verification.
 */
export const IDENTITY_ARCHITECTURE = deepFreeze({
  identityVerifiedSemanticOwner: IDENTITY_VERIFICATION_STATE_CONTRACT.identityVerifiedSemanticOwner,
  selectedArchitecture: IDENTITY_VERIFICATION_STATE_CONTRACT.selectedArchitecture,
  architectureOneFinal: IDENTITY_VERIFICATION_STATE_CONTRACT.ARCHITECTURE_1_IS_FINAL,
  coreEnvelopeIdentityVerifiedInvariant: ENVELOPE_INVARIANTS.identityVerified,
  upstreamDeclaredEnvelopeIdentityVerified: IDENTITY_VERIFICATION_STATE_CONTRACT.coreEnvelopeCurrentInvariantIdentityVerified,
  builderVerificationRecordedOutsideEnvelope: true,
  coreEnvelopeVerificationStateAmendmentRequired: IDENTITY_VERIFICATION_STATE_CONTRACT.coreEnvelopeVerificationStateAmendmentRequired,
  identityVerificationMeaning: 'builder_source_core_digest_verification',
});
export default IDENTITY_ARCHITECTURE;

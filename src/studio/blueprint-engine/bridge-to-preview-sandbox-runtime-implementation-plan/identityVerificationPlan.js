import { DIGEST_RECOMPUTATION_INPUT_PLAN } from './digestRecomputationInputPlan.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * IDENTITY VERIFICATION PLAN — how the FUTURE runtime will verify the {bridgeDecisionDigest, targetDescriptor}
 * identity via recompute-and-compare, AND the explicit, non-silent resolution of blocker B-RECOMPUTE-INPUT.
 *
 * Per §13 the plan must SELECT one of three valid options for reconstructing the full digest preimage:
 *   A. the future envelope carries the minimal additional preimage fields needed for full recomputation
 *   B. the envelope carries the complete bridgeDecision core
 *   C. identity is validated BEFORE envelope extraction, at the bridge-decision boundary
 *
 * The digest-recomputation gap analysis proves the CURRENTLY-CONTRACTED 17-field envelope carries only 3 of the
 * 32 preimage fields (29 missing). Therefore the runtime CANNOT recompute the digest from today's envelope. This
 * plan SELECTS option A as the required resolution (minimal additional preimage carriage) and records option C as
 * the documented architectural alternative. Because option A requires a FUTURE, not-yet-merged amendment to the
 * envelope-identity contract, the blocker is NOT yet resolved by an available contract: `bRecomputeInputResolved
 * ByPlan` is FALSE and runtime implementation stays BLOCKED (fail-closed). No silent solution is invented.
 */
const missingCount = DIGEST_RECOMPUTATION_INPUT_PLAN.preimageFieldsMissingCount;
const sufficientNow = DIGEST_RECOMPUTATION_INPUT_PLAN.envelopeFieldsSufficientForRecompute;

export const B_RECOMPUTE_INPUT = deepFreeze({
  blockerId: 'B-RECOMPUTE-INPUT',
  description: 'The future runtime must recompute bridgeDecisionDigest to verify identity, but the merged 17-field '
    + 'envelope carries only 3 of the 32 decision-preimage fields (29 missing). Coverage (proven in #488) is not '
    + 'the same as recomputation inputs being present in the envelope.',
  requiredPreimageFieldCount: DIGEST_RECOMPUTATION_INPUT_PLAN.requiredDecisionPreimageFieldCount,
  availablePreimageFieldCount: DIGEST_RECOMPUTATION_INPUT_PLAN.preimageFieldsAvailableCount,
  missingPreimageFieldCount: missingCount,
  missingPreimageFields: [...DIGEST_RECOMPUTATION_INPUT_PLAN.preimageFieldsMissingFromEnvelope],
  envelopeFieldsSufficientForRecompute: sufficientNow,
  options: deepFreeze([
    deepFreeze({ option: 'A', title: 'Envelope carries minimal additional preimage fields',
      selected: true,
      detail: 'Amend the future envelope-identity contract to carry the remaining ' + missingCount + ' scalar/'
        + 'small decision-preimage fields (targetDescriptor, the single large field, is already carried). This '
        + 'lets the consumer recompute the full 32-field preimage and compare byte-for-byte.',
      requiresFutureContractAmendment: true }),
    deepFreeze({ option: 'B', title: 'Envelope carries the complete bridgeDecision core',
      selected: false,
      detail: 'Carry the entire 32-field decision core in the envelope. Correct but heavier than A and duplicates '
        + 'data the descriptor already contains.',
      requiresFutureContractAmendment: true }),
    deepFreeze({ option: 'C', title: 'Identity validated at the bridge-decision boundary',
      selected: false,
      documentedAlternative: true,
      detail: 'Verify the digest where the full decision object still exists (the bridge boundary) and emit the '
        + 'envelope as a post-verification provenance token. Valid, but the consumer then cannot INDEPENDENTLY '
        + 'recompute — it trusts the boundary. Recorded as the fallback architecture if amendment A is rejected.',
      requiresFutureContractAmendment: false }),
  ]),
  selectedOption: 'A',
  documentedAlternativeOption: 'C',
  // Fail-closed: the selected resolution needs a future contract that does not yet exist, so the blocker is OPEN.
  resolvedByPlan: false,
  runtimeImplementationBlocked: true,
  rationale: 'Option A is selected as the required resolution and specified concretely (exact missing fields). '
    + 'But it depends on a future envelope-contract amendment that is NOT yet merged; until that amendment lands '
    + 'and is audited, recomputation inputs are incomplete, so runtime implementation remains blocked.',
});

export const IDENTITY_VERIFICATION_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-identity-verification-plan',
  identityVerificationMode: 'recompute_and_compare',
  algorithm: [...DIGEST_RECOMPUTATION_INPUT_PLAN.algorithm],
  identitySynthesisAllowed: false,
  identityAliasAllowed: false,
  identityFallbackAllowed: false,
  digestAndDescriptorMustComeFromSameDecision: true,
  bIdentityClosedByContract: true,
  bRecomputeInput: B_RECOMPUTE_INPUT,
  bRecomputeInputResolvedByPlan: B_RECOMPUTE_INPUT.resolvedByPlan,
  implementationCannotProceedUntilDigestRecomputationInputsAreComplete: true,
  identityVerificationImplemented: false,
});

export default IDENTITY_VERIFICATION_PLAN;

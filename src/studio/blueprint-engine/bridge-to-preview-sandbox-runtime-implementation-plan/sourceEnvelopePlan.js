import {
  REAL_ENVELOPE_FIELDS, REAL_ENVELOPE_REQUIRED_FIELDS, REAL_ENVELOPE_INVARIANTS,
  SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION,
} from './planConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * The exact FUTURE runtime input: the real BridgeDecisionIdentityEnvelope, reflected READ-ONLY from the merged
 * Bridge Decision Envelope Identity Contract (#488). No field is invented; the shape and invariants are the
 * contract's own. The runtime consumes this envelope; it does NOT build it (envelope builder is a separate future
 * concern). Declaration only.
 */
export const SOURCE_ENVELOPE_PLAN = deepFreeze({
  kind: 'bridge-to-preview-sandbox-runtime-source-envelope-plan',
  inputName: 'BridgeDecisionIdentityEnvelope',
  sourceContractVersion: SOURCE_ENVELOPE_IDENTITY_CONTRACT_VERSION,
  // Real envelope fields (17) reflected from the contract — no invented field.
  envelopeFields: [...REAL_ENVELOPE_FIELDS],
  envelopeFieldCount: REAL_ENVELOPE_FIELDS.length,
  requiredFields: [...REAL_ENVELOPE_REQUIRED_FIELDS],
  invariants: { ...REAL_ENVELOPE_INVARIANTS },
  // Future runtime requirements over the envelope.
  requirements: deepFreeze({
    explicitEnvelopeRequired: true,
    bridgeDecisionDigestRequired: true,
    targetDescriptorRequired: true,
    sameDecisionPairRequired: true,
    identitySynthesisAllowed: false,
    identityAliasAllowed: false,
    identityFallbackAllowed: false,
  }),
  // The runtime consumes the envelope read-only; it never mutates or retains references.
  sourceConsumedReadOnly: true,
  envelopeBuilderImplemented: false,
  consumerRuntimeInvoked: false,
});

export default SOURCE_ENVELOPE_PLAN;

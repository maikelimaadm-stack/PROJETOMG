import { ENVELOPE_FIELDS, ENVELOPE_KIND, ENVELOPE_VERSION_TAG, DIGEST_FIELD } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'core_envelope_shape_validation';
const VERSION_STAGE = 'core_envelope_version_validation';
const IDENTITY_STAGE = 'identity_verification_state_validation';

/**
 * Stage 14 ONLY: the envelope's declared version tuple (envelopeKind + envelopeVersion). Split out of the shape
 * validator so the 23-stage pipeline can execute it as its own atomic stage and emit ONLY that stage's issues.
 */
export function validateCoreEnvelopeVersion(envelope) {
  const issues = [];
  if (!envelope || typeof envelope !== 'object') { issues.push(makeIssue('BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', VERSION_STAGE)); return issues; }
  if (envelope.envelopeKind !== ENVELOPE_KIND || envelope.envelopeVersion !== ENVELOPE_VERSION_TAG) issues.push(makeIssue('BUILDER_ENVELOPE_VERSION_UNSUPPORTED', VERSION_STAGE));
  return issues;
}

/**
 * Stage 16 ONLY: the pre-consumer verification state. `identityVerified` is CONSUMER-owned, so a builder-emitted
 * envelope must always carry it false, together with the four other not-yet-happened consumer-side flags.
 */
export function validateIdentityVerificationState(envelope) {
  const issues = [];
  if (!envelope || typeof envelope !== 'object') { issues.push(makeIssue('BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', IDENTITY_STAGE)); return issues; }
  if (envelope.identityVerified !== false || envelope.coreConsumed !== false || envelope.consumerRuntimeInvoked !== false
    || envelope.previewMounted !== false || envelope.productExposed !== false) issues.push(makeIssue('BUILDER_IDENTITY_VERIFICATION_STATE_INVALID', IDENTITY_STAGE));
  return issues;
}

/**
 * Stage 15 ONLY: the envelope's structural shape — exact 12 fields, no invented field, no missing field, the three
 * positive invariants, digest present once at top level and never inside core, target only inside core.
 * Version and verification-state checks live in their own stages (see the two validators above).
 */
export function validateCoreEnvelopeShape(envelope) {
  const issues = [];
  const keys = Object.keys(envelope);
  if (keys.length !== ENVELOPE_FIELDS.length) issues.push(makeIssue('BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', STAGE));
  for (const k of keys) { if (!ENVELOPE_FIELDS.includes(k)) issues.push(makeIssue('BUILDER_ENVELOPE_INVENTED_FIELD', STAGE)); }
  for (const f of ENVELOPE_FIELDS) { if (!Object.prototype.hasOwnProperty.call(envelope, f)) issues.push(makeIssue('BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', STAGE)); }
  if (envelope.synthetic !== true || envelope.immutable !== true || envelope.metadataOnly !== true) issues.push(makeIssue('BUILDER_ENVELOPE_INVENTED_FIELD', STAGE));
  // digest present once (top-level), not inside core; target only inside core.
  const core = envelope.bridgeDecisionCore;
  if (core && typeof core === 'object' && Object.prototype.hasOwnProperty.call(core, DIGEST_FIELD)) issues.push(makeIssue('BUILDER_DIGEST_INSIDE_CORE_FORBIDDEN', STAGE));
  if (Object.prototype.hasOwnProperty.call(envelope, 'targetDescriptor')) issues.push(makeIssue('BUILDER_ENVELOPE_INVENTED_FIELD', STAGE));
  if (!core || typeof core !== 'object' || !Object.prototype.hasOwnProperty.call(core, 'targetDescriptor')) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE));
  return issues;
}
export default validateCoreEnvelopeShape;

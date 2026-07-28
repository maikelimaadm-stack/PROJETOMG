import { ENVELOPE_FIELDS, ENVELOPE_KIND, ENVELOPE_VERSION_TAG, DIGEST_FIELD } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'core_envelope_shape_validation';
/** Validates the constructed envelope: exact 12 fields, correct kind/version, invariants, digest/core once, target only inside core. */
export function validateCoreEnvelopeShape(envelope) {
  const issues = [];
  const keys = Object.keys(envelope);
  if (keys.length !== ENVELOPE_FIELDS.length) issues.push(makeIssue('BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', STAGE));
  for (const k of keys) { if (!ENVELOPE_FIELDS.includes(k)) issues.push(makeIssue('BUILDER_ENVELOPE_INVENTED_FIELD', STAGE)); }
  for (const f of ENVELOPE_FIELDS) { if (!Object.prototype.hasOwnProperty.call(envelope, f)) issues.push(makeIssue('BUILDER_PARTIAL_ENVELOPE_FORBIDDEN', STAGE)); }
  if (envelope.envelopeKind !== ENVELOPE_KIND || envelope.envelopeVersion !== ENVELOPE_VERSION_TAG) issues.push(makeIssue('BUILDER_ENVELOPE_VERSION_UNSUPPORTED', 'core_envelope_version_validation'));
  if (envelope.synthetic !== true || envelope.immutable !== true || envelope.metadataOnly !== true) issues.push(makeIssue('BUILDER_ENVELOPE_INVENTED_FIELD', STAGE));
  if (envelope.identityVerified !== false || envelope.coreConsumed !== false || envelope.consumerRuntimeInvoked !== false || envelope.previewMounted !== false || envelope.productExposed !== false) issues.push(makeIssue('BUILDER_IDENTITY_VERIFICATION_STATE_INVALID', 'identity_verification_state_validation'));
  // digest present once (top-level), not inside core; target only inside core.
  const core = envelope.bridgeDecisionCore;
  if (core && typeof core === 'object' && Object.prototype.hasOwnProperty.call(core, DIGEST_FIELD)) issues.push(makeIssue('BUILDER_DIGEST_INSIDE_CORE_FORBIDDEN', STAGE));
  if (Object.prototype.hasOwnProperty.call(envelope, 'targetDescriptor')) issues.push(makeIssue('BUILDER_ENVELOPE_INVENTED_FIELD', STAGE));
  if (!core || typeof core !== 'object' || !Object.prototype.hasOwnProperty.call(core, 'targetDescriptor')) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE));
  return issues;
}
export default validateCoreEnvelopeShape;

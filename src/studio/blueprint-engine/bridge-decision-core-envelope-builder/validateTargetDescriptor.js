import {
  TARGET_DESCRIPTOR_FIELDS, TARGET_DESCRIPTOR_REQUIRED_FIELDS, TARGET_DESCRIPTOR_SECURITY_FIELDS,
  TARGET_DESCRIPTOR_VERSION_FIELDS, TARGET_DESCRIPTOR_DIGEST_FIELDS, TARGET_DESCRIPTOR_INVARIANTS,
  TARGET_DESCRIPTOR_KIND, TARGET_DESCRIPTOR_TARGET_KIND, SOURCE_TARGET_CONTRACT_VERSION, RESOURCE_LIMITS,
} from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
import { hasPrototypePollutionKey } from './prototypePollutionGuard.js';
const STAGE = 'source_target_descriptor_validation';
const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v)
  && (Object.getPrototypeOf(v) === Object.prototype || Object.getPrototypeOf(v) === null);
const isDigest = (v) => typeof v === 'string' && /^fnv1a-[0-9a-f]{8}$/.test(v);
const isVersion = (v) => typeof v === 'string' && /@\d+\.\d+\.\d+$/.test(v);

/**
 * Exact target-descriptor validation against the REAL 23-field upstream shape: exact field set, all required fields,
 * zero invented fields, exact kind/targetKind, exact target contract version, valid digests, the four positive
 * invariants true, every security field false, valid candidate identity, safe syntheticPayload, no pollution and
 * within the real maxTargetDescriptorFields limit.
 */
export function validateTargetDescriptor(source) {
  const issues = [];
  const td = source.targetDescriptor;
  if (!isPlain(td)) { issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE, 'blocker', 'targetDescriptor')); return issues; }

  const keys = Object.keys(td);
  // Exact 23-field shape: no invented, no missing.
  for (const k of keys) { if (!TARGET_DESCRIPTOR_FIELDS.includes(k)) issues.push(makeIssue('BUILDER_SOURCE_INVENTED_FIELD', STAGE, 'blocker', 'targetDescriptor')); }
  for (const f of TARGET_DESCRIPTOR_FIELDS) { if (!Object.prototype.hasOwnProperty.call(td, f)) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE, 'blocker', 'targetDescriptor')); }
  if (keys.length > RESOURCE_LIMITS.maxTargetDescriptorFields) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE, 'blocker', 'targetDescriptor'));
  // Required fields non-empty.
  for (const f of TARGET_DESCRIPTOR_REQUIRED_FIELDS) {
    const v = td[f];
    if (typeof v !== 'string' || v.length === 0) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE, 'blocker', `targetDescriptor.${f}`));
  }
  // Exact identity.
  if (td.kind !== TARGET_DESCRIPTOR_KIND) issues.push(makeIssue('BUILDER_SOURCE_KIND_MISMATCH', STAGE, 'blocker', 'targetDescriptor.kind'));
  if (td.targetKind !== TARGET_DESCRIPTOR_TARGET_KIND) issues.push(makeIssue('BUILDER_SOURCE_KIND_MISMATCH', STAGE, 'blocker', 'targetDescriptor.targetKind'));
  if (typeof SOURCE_TARGET_CONTRACT_VERSION === 'string' && td.targetContractVersion !== SOURCE_TARGET_CONTRACT_VERSION) {
    issues.push(makeIssue('BUILDER_SOURCE_VERSION_MISMATCH', STAGE, 'blocker', 'targetDescriptor.targetContractVersion'));
  }
  // Versions well-formed.
  for (const f of TARGET_DESCRIPTOR_VERSION_FIELDS) { if (!isVersion(td[f])) issues.push(makeIssue('BUILDER_SOURCE_VERSION_MISMATCH', STAGE, 'blocker', `targetDescriptor.${f}`)); }
  // Digests well-formed.
  for (const f of TARGET_DESCRIPTOR_DIGEST_FIELDS) { if (!isDigest(td[f])) issues.push(makeIssue('BUILDER_DIGEST_REQUIRED', STAGE, 'blocker', `targetDescriptor.${f}`)); }
  // Positive invariants.
  for (const [f, expected] of Object.entries(TARGET_DESCRIPTOR_INVARIANTS)) {
    if (td[f] !== expected) issues.push(makeIssue('BUILDER_IDENTITY_VERIFICATION_STATE_INVALID', STAGE, 'blocker', `targetDescriptor.${f}`));
  }
  // Security fields must be false.
  for (const f of TARGET_DESCRIPTOR_SECURITY_FIELDS) {
    if (td[f] !== false) issues.push(makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', STAGE, 'blocker', `targetDescriptor.${f}`));
  }
  // Candidate identity.
  if (!Number.isInteger(td.candidateDraftRevision) || td.candidateDraftRevision < 0) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE, 'blocker', 'targetDescriptor.candidateDraftRevision'));
  // syntheticPayload must be a safe plain object.
  if (!isPlain(td.syntheticPayload)) issues.push(makeIssue('BUILDER_SOURCE_NON_PLAIN_OBJECT', STAGE, 'blocker', 'targetDescriptor.syntheticPayload'));
  // Pollution.
  if (hasPrototypePollutionKey(td)) issues.push(makeIssue('BUILDER_PROTOTYPE_POLLUTION_KEY_FORBIDDEN', STAGE, 'blocker', 'targetDescriptor'));
  return issues;
}
export default validateTargetDescriptor;

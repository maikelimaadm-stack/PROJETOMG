import { stableSerialize } from '../module-blueprint-authoring-runtime/index.js';
import { RESOURCE_LIMITS, RESOURCE_DIMENSIONS } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';

const ENCODER = new TextEncoder();
/** Deterministic UTF-8 byte length of the canonical serialization (never `.length`). */
export function utf8ByteLength(value) {
  return ENCODER.encode(stableSerialize(value)).byteLength;
}
/** Deepest string length found in a value (recursive), used for maxStringLength enforcement. */
export function maxStringLengthIn(value, depth = 0, maxDepth = 512) {
  if (depth > maxDepth) return Infinity;
  if (typeof value === 'string') return value.length;
  if (value === null || typeof value !== 'object') return 0;
  let worst = 0;
  for (const k of Object.keys(value)) {
    if (k.length > worst) worst = k.length;
    const child = maxStringLengthIn(value[k], depth + 1, maxDepth);
    if (child > worst) worst = child;
  }
  return worst;
}
/** Fail-closed check that a dimension name is one of the real nine. */
export function isKnownDimension(name) { return RESOURCE_DIMENSIONS.includes(name); }

/**
 * maxSourceDecisionFields — anchored on the SHAPE stage, not on normalization: a decision carrying more than the real
 * 33 fields is a shape defect, and the shape stage is where the field set is judged (so an invented field is reported
 * as an invented field, never shadowed by a limit issue raised one stage earlier).
 */
export function enforceSourceFieldCountLimit(source) {
  const issues = [];
  if (Object.keys(source).length > RESOURCE_LIMITS.maxSourceDecisionFields) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', 'source_decision_shape_validation', 'blocker', 'source'));
  return issues;
}
/** maxSourceDecisionBytes + maxStringLength (recursive) on the normalized source. */
export function enforceSourceResourceLimits(source) {
  const issues = [];
  const STAGE = 'source_structure_normalization';
  let bytes;
  try { bytes = utf8ByteLength(source); } catch { bytes = RESOURCE_LIMITS.maxSourceDecisionBytes + 1; }
  if (bytes > RESOURCE_LIMITS.maxSourceDecisionBytes) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE, 'blocker', 'source.bytes'));
  if (maxStringLengthIn(source) > RESOURCE_LIMITS.maxStringLength) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE, 'blocker', 'source.string'));
  return issues;
}
/** maxTargetDescriptorFields on the target descriptor. */
export function enforceTargetDescriptorLimits(targetDescriptor) {
  const issues = [];
  const STAGE = 'source_target_descriptor_validation';
  if (!targetDescriptor || typeof targetDescriptor !== 'object') return issues;
  if (Object.keys(targetDescriptor).length > RESOURCE_LIMITS.maxTargetDescriptorFields) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE, 'blocker', 'targetDescriptor'));
  return issues;
}
/** maxCoreFields + maxCoreBytes on the extracted core. */
export function enforceCoreResourceLimits(core) {
  const issues = [];
  const STAGE = 'core_completeness_validation';
  if (Object.keys(core).length > RESOURCE_LIMITS.maxCoreFields) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE, 'blocker', 'core'));
  let bytes;
  try { bytes = utf8ByteLength(core); } catch { bytes = RESOURCE_LIMITS.maxCoreBytes + 1; }
  if (bytes > RESOURCE_LIMITS.maxCoreBytes) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE, 'blocker', 'core.bytes'));
  return issues;
}
/** maxEnvelopeBytes — enforced BEFORE the envelope is emitted. */
export function enforceEnvelopeResourceLimits(envelope) {
  const issues = [];
  const STAGE = 'core_envelope_shape_validation';
  let bytes;
  try { bytes = utf8ByteLength(envelope); } catch { bytes = RESOURCE_LIMITS.maxEnvelopeBytes + 1; }
  if (bytes > RESOURCE_LIMITS.maxEnvelopeBytes) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE, 'blocker', 'envelope.bytes'));
  return issues;
}
/** maxStructureDepth: measured depth of a value (used by the normalizer's cap and by direct boundary proofs). */
export function structureDepthOf(value, depth = 0) {
  if (value === null || typeof value !== 'object') return depth;
  let worst = depth;
  for (const k of Object.keys(value)) {
    const child = structureDepthOf(value[k], depth + 1);
    if (child > worst) worst = child;
  }
  return worst;
}
export function enforceStructureDepth(value) {
  const issues = [];
  if (structureDepthOf(value) > RESOURCE_LIMITS.maxStructureDepth) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', 'source_structure_normalization', 'blocker', 'depth'));
  return issues;
}
export default enforceSourceResourceLimits;

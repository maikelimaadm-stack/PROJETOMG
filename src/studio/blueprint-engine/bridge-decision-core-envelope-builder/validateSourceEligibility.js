import { DECISION_KIND, DECISION_SUCCESS_STATUS, DIGEST_FIELD } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'source_decision_eligibility_validation';
const isPlain = (v) => v !== null && typeof v === 'object' && !Array.isArray(v);
/** Enforces success eligibility exactly (kind/ok/status/targetDescriptorCreated/targetDescriptor/digest). */
export function validateSourceEligibility(source) {
  const issues = [];
  if (source.kind !== DECISION_KIND) issues.push(makeIssue('BUILDER_SOURCE_KIND_MISMATCH', STAGE));
  if (source.ok !== true || source.status !== DECISION_SUCCESS_STATUS) issues.push(makeIssue('BUILDER_SOURCE_NOT_READY', STAGE));
  if (source.targetDescriptorCreated !== true || !isPlain(source.targetDescriptor)) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE));
  if (typeof source[DIGEST_FIELD] !== 'string' || source[DIGEST_FIELD].length === 0) issues.push(makeIssue('BUILDER_DIGEST_REQUIRED', STAGE));
  return issues;
}
export default validateSourceEligibility;

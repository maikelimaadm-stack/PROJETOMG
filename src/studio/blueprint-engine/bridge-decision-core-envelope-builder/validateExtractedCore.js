import { CORE_ALLOWLIST, CORE_FIELD_COUNT, DIGEST_FIELD } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'core_completeness_validation';
/** Validates the extracted core: exactly 32 fields, zero missing/extra, digest absent, target present. */
export function validateExtractedCore(core, missing) {
  const issues = [];
  for (const m of (Array.isArray(missing) ? missing : [])) { void m; issues.push(makeIssue('BUILDER_CORE_FIELD_MISSING', STAGE)); }
  const keys = Object.keys(core);
  for (const k of keys) { if (!CORE_ALLOWLIST.includes(k)) issues.push(makeIssue('BUILDER_CORE_FIELD_EXTRA', STAGE)); }
  if (Object.prototype.hasOwnProperty.call(core, DIGEST_FIELD)) issues.push(makeIssue('BUILDER_DIGEST_INSIDE_CORE_FORBIDDEN', 'digest_presence_validation'));
  if (!Object.prototype.hasOwnProperty.call(core, 'targetDescriptor')) issues.push(makeIssue('BUILDER_TARGET_DESCRIPTOR_REQUIRED', STAGE));
  if (issues.length === 0 && keys.length !== CORE_FIELD_COUNT) issues.push(makeIssue('BUILDER_CORE_FIELD_MISSING', STAGE));
  return issues;
}
export default validateExtractedCore;

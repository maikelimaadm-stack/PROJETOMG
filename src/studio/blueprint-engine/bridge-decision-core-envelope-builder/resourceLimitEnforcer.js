import { stableSerialize } from '../module-blueprint-authoring-runtime/index.js';
import { RESOURCE_LIMITS } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'resource_limit_enforcement';
/** Enforces the real resource limits on the (normalized) source. No silent truncation — over-limit ⇒ blocker. */
export function enforceSourceResourceLimits(source) {
  const issues = [];
  if (Object.keys(source).length > RESOURCE_LIMITS.maxSourceDecisionFields) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE));
  let bytes = 0;
  try { bytes = stableSerialize(source).length; } catch { bytes = RESOURCE_LIMITS.maxSourceDecisionBytes + 1; }
  if (bytes > RESOURCE_LIMITS.maxSourceDecisionBytes) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', STAGE));
  return issues;
}
/** Enforces the real resource limits on the extracted core. */
export function enforceCoreResourceLimits(core) {
  const issues = [];
  if (Object.keys(core).length > RESOURCE_LIMITS.maxCoreFields) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', 'core_limit_enforcement'));
  let bytes = 0;
  try { bytes = stableSerialize(core).length; } catch { bytes = RESOURCE_LIMITS.maxCoreBytes + 1; }
  if (bytes > RESOURCE_LIMITS.maxCoreBytes) issues.push(makeIssue('BUILDER_LIMIT_EXCEEDED', 'core_limit_enforcement'));
  return issues;
}
export default enforceSourceResourceLimits;

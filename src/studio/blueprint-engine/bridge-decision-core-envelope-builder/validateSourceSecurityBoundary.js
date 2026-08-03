import { makeIssue } from './normalizeIssues.js';
const STAGE = 'source_security_boundary_validation';
// Flags that MUST be false/inert on a valid pre-consumer source decision.
const FORBIDDEN_TRUE_FLAGS = Object.freeze([
  'previewMounted', 'appTouched', 'routeCreated', 'menuCreated', 'persisted', 'productExposed', 'moduleGenerated',
  'certificationPerformed', 'realDataRead', 'sourceMutated', 'databaseRollbackRequired', 'filesystemCleanupRequired',
  'externalCleanupRequired',
]);
/** Rejects a source that asserts any side-effect / exposure flag as true, or a non-zero sideEffects count. */
export function validateSourceSecurityBoundary(source) {
  const issues = [];
  for (const f of FORBIDDEN_TRUE_FLAGS) { if (source[f] === true) { issues.push(makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', STAGE)); } }
  if (typeof source.sideEffects === 'number' && source.sideEffects !== 0) issues.push(makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', STAGE));
  if (source.sideEffects === true) issues.push(makeIssue('BUILDER_SOURCE_SECURITY_FLAG_FORBIDDEN', STAGE));
  return issues;
}
export default validateSourceSecurityBoundary;

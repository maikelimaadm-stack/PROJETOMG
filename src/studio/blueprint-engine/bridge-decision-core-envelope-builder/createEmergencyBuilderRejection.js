import { createBuilderRejection } from './createBuilderRejection.js';
import { makeIssue } from './normalizeIssues.js';
/**
 * Sanitized emergency rejection for any unexpected exception at the public boundary (including malicious Proxy
 * traps). Carries only BUILDER_UNEXPECTED_EXECUTION_FAILURE — never the raw error, cause, stack, path or source.
 */
export function createEmergencyBuilderRejection() {
  return createBuilderRejection([makeIssue('BUILDER_UNEXPECTED_EXECUTION_FAILURE', 'public_boundary', 'blocker')]);
}
export default createEmergencyBuilderRejection;

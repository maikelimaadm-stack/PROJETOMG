import { SOURCE_BRIDGE_VERSION } from './builderConfig.js';
import { makeIssue } from './normalizeIssues.js';
const STAGE = 'source_version_validation';
/** Exact bridge version match; drift fails closed. */
export function validateSourceVersions(source) {
  const issues = [];
  if (typeof source.bridgeVersion !== 'string' || source.bridgeVersion.length === 0) {
    issues.push(makeIssue('BUILDER_SOURCE_VERSION_MISMATCH', STAGE));
  } else if (typeof SOURCE_BRIDGE_VERSION === 'string' && source.bridgeVersion !== SOURCE_BRIDGE_VERSION) {
    issues.push(makeIssue('BUILDER_SOURCE_VERSION_MISMATCH', STAGE));
  }
  return issues;
}
export default validateSourceVersions;

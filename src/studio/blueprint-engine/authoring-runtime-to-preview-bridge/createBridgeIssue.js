import { BRIDGE_ISSUE_SEVERITIES, BRIDGE_VALIDATION_STAGES, BRIDGE_ISSUE_CODES } from './bridgeRuntimeConfig.js';

/**
 * Builds a deterministic, sanitized bridge validation issue. `error`/`blocker` block the bridge and the
 * preview sandbox handoff. No secrets, no auto-correction. Pure. @param {Object} [options] @returns {Object}
 */
export function createBridgeIssue(options = {}) {
  const o = options && typeof options === 'object' ? options : {};
  const issueCode = BRIDGE_ISSUE_CODES.includes(o.issueCode) ? o.issueCode : 'BRIDGE_CONFIG_INVALID';
  const severity = BRIDGE_ISSUE_SEVERITIES.includes(o.severity) ? o.severity : 'blocker';
  const stage = BRIDGE_VALIDATION_STAGES.includes(o.stage) ? o.stage : 'source_shape_validation';
  const pathStr = typeof o.path === 'string' && o.path.length > 0 ? o.path : 'source';
  const message = typeof o.message === 'string' && o.message.length > 0 ? o.message : `Bridge issue: ${issueCode}`;
  const blocks = severity === 'blocker' || severity === 'error';
  return {
    kind: 'bridge-validation-issue',
    issueCode,
    severity,
    stage,
    path: pathStr,
    message,
    deterministic: true,
    blocksBridge: blocks,
    blocksPreviewSandbox: blocks,
    autoCorrected: false,
    withoutSecrets: true,
  };
}

export default createBridgeIssue;

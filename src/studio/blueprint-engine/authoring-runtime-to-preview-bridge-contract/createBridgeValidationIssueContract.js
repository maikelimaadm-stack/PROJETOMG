import { BRIDGE_ISSUE_SEVERITIES, bridgeDigest } from './bridgeContractConfig.js';
import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';

/**
 * Builds a deterministic, sanitized bridge validation issue descriptor. `error`/`blocker` block the
 * bridge and the preview sandbox handoff. Metadata only. @param {Object} [options] @returns {Object}
 */
export function createBridgeValidationIssueContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const issueCode = typeof o.issueCode === 'string' && o.issueCode.length > 0 ? o.issueCode : 'BRIDGE_ISSUE';
  const severity = BRIDGE_ISSUE_SEVERITIES.includes(o.severity) ? o.severity : 'warning';
  const stage = typeof o.stage === 'string' && o.stage.length > 0 ? o.stage : 'source_shape_validation';
  const pathStr = typeof o.path === 'string' && o.path.length > 0 ? o.path : 'source';
  const message = typeof o.message === 'string' && o.message.length > 0 ? o.message : `Bridge issue: ${issueCode}`;
  const blocks = severity === 'blocker' || severity === 'error';
  const core = {
    kind: 'bridge-validation-issue',
    issueCode, severity, stage, path: pathStr, message,
    deterministic: true,
    blocksBridge: blocks,
    blocksPreviewSandbox: blocks,
    safe: true,
    withoutSecrets: true,
    autoCorrected: false,
  };
  return safeCloneGenericModel({ ...core, issueDigest: bridgeDigest(core) });
}

export default createBridgeValidationIssueContract;

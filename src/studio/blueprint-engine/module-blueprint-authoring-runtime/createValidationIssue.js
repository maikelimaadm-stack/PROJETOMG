import { AUTHORING_ISSUE_SEVERITIES } from './authoringRuntimeConfig.js';
import { isPlainObject, safeString } from './normalizeAuthoringInput.js';
import { createDeterministicDigest } from './createDeterministicDigest.js';

/**
 * Builds a deterministic, sanitized validation issue. No secrets, no stack, no real data. `error` and
 * `blocker` block preview and certification-candidate handoff. Pure.
 *
 * @param {Object} [options]
 * @returns {Object}
 */
export function createValidationIssue(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const issueCode = safeString(o.issueCode, 'AUTHORING_ISSUE', 200);
  const severity = AUTHORING_ISSUE_SEVERITIES.includes(o.severity) ? o.severity : 'warning';
  const stage = safeString(o.stage, 'shape_validation', 200);
  const path = safeString(o.path, 'draft', 400);
  const message = safeString(o.message, `Authoring issue: ${issueCode}`, 2000);
  const blocks = severity === 'blocker' || severity === 'error';
  const core = {
    kind: 'authoring-validation-issue',
    issueCode,
    severity,
    stage,
    path,
    message,
    deterministic: true,
    blocksPreview: blocks,
    blocksCertificationCandidate: blocks,
    safe: true,
    withoutSecrets: true,
  };
  return Object.freeze({ ...core, issueDigest: createDeterministicDigest(core) });
}

/** Stable ordering key: stage index, then path, then code. @param {Object[]} issues @param {string[]} stageOrder */
export function sortValidationIssues(issues, stageOrder) {
  const order = Array.isArray(stageOrder) ? stageOrder : [];
  const list = Array.isArray(issues) ? [...issues] : [];
  return list.sort((a, b) => {
    const sa = order.indexOf(a.stage); const sb = order.indexOf(b.stage);
    if (sa !== sb) return sa - sb;
    if (a.path !== b.path) return a.path < b.path ? -1 : 1;
    if (a.issueCode !== b.issueCode) return a.issueCode < b.issueCode ? -1 : 1;
    return 0;
  });
}

export default createValidationIssue;

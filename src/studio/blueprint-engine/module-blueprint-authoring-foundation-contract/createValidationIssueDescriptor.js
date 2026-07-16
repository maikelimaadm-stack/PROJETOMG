import { isGenericModelPlainObject, safeCloneGenericModel } from '../../../runtime/generic-model/index.js';
import { AUTHORING_ISSUE_SEVERITIES, authoringFoundationDigest } from './authoringFoundationContractConfig.js';

/**
 * Describes a single VALIDATION ISSUE — a temporary, non-canonical, DETERMINISTIC diagnostic emitted
 * while validating an authoring draft. Metadata only, sanitized: no secrets, no stack, no personal
 * data. A `blocker` (or `error`) severity blocks preview and certification-candidate handoff; it NEVER
 * implies a real failure of the certified contract. Pure and deterministic; same input -> same
 * descriptor + digest.
 *
 * @param {Object} [options]
 * @param {string} [options.issueCode]
 * @param {string} [options.severity] one of AUTHORING_ISSUE_SEVERITIES (default 'warning')
 * @param {string} [options.path] the draft path (field key, section id, relationship id)
 * @param {string} [options.message] sanitized message
 * @returns {Object}
 */
export function createValidationIssueDescriptor(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const issueCode = typeof o.issueCode === 'string' && o.issueCode.length > 0 ? o.issueCode
    : (typeof o.issueId === 'string' && o.issueId.length > 0 ? o.issueId : 'AUTHORING_ISSUE');
  const severity = AUTHORING_ISSUE_SEVERITIES.includes(o.severity) ? o.severity : 'warning';
  const path = typeof o.path === 'string' && o.path.length > 0 ? o.path
    : (typeof o.target === 'string' && o.target.length > 0 ? o.target : 'draft');
  const message = typeof o.message === 'string' && o.message.length > 0 ? o.message : `Authoring validation issue: ${issueCode}`;
  const blocks = severity === 'blocker' || severity === 'error';

  const core = {
    kind: 'authoring-validation-issue-descriptor',
    issueCode,
    issueId: issueCode,
    severity,
    path,
    target: path,
    message,
    deterministic: true,
    blocksPreview: blocks,
    blocksCertificationCandidate: blocks,
    isBlocker: severity === 'blocker',
    safe: true,
    withoutSecrets: true,
    noStackLeak: true,
    canonical: false,
    draftOnly: true,
    affectsCertifiedContract: false,
  };
  return safeCloneGenericModel({ ...core, validationIssueDigest: authoringFoundationDigest(core) });
}

export default createValidationIssueDescriptor;

import { ISSUE_CODES, ISSUE_SEVERITIES, ISSUE_SHAPE_FIELDS, RESOURCE_LIMITS, PIPELINE_STAGES } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * CLOSED stage allowlist: the 23 canonical pipeline stages plus the only two non-pipeline boundaries the builder
 * legitimately reports from — `config_normalization` (before the pipeline starts) and `public_boundary` (the public
 * API edge). There is NO pattern fallback: an arbitrary lowercase token such as `made_up_stage` is NOT accepted and
 * collapses deterministically to `unknown`.
 */
export const ISSUE_STAGE_ALLOWLIST = deepFreeze([...PIPELINE_STAGES, 'config_normalization', 'public_boundary']);

/** True iff `stage` is one of the 25 allowed issue stages. */
export function isAllowedIssueStage(stage) {
  return typeof stage === 'string' && ISSUE_STAGE_ALLOWLIST.includes(stage);
}

/** Safe, deterministic, relative path token. Never an absolute path, raw value or secret. */
function sanitizePath(p) {
  if (typeof p !== 'string' || p.length === 0) return '';
  // Only a dotted/relative field path made of safe tokens; anything else collapses deterministically.
  return /^[A-Za-z0-9_.[\]]{1,120}$/.test(p) && !p.startsWith('/') ? p : '';
}
/** Deterministic, code-derived message. Never an exception message, stack, cause or raw value. */
function deterministicMessage(issueCode) {
  return `builder rejected: ${issueCode}`;
}

/**
 * Builds a single issue in the EXACT contract shape (10 fields):
 * issueCode, severity, stage, path, message, deterministic, blocksBuilder, blocksEnvelope, blocksRuntime,
 * blocksPreviewSandbox. Only a known issue code, a known stage, a sanitized relative path and a code-derived
 * message are ever emitted.
 */
export function makeIssue(issueCode, stage, severity = 'blocker', path = '') {
  const safeCode = ISSUE_CODES.includes(issueCode) ? issueCode : 'BUILDER_CONFIG_INVALID';
  const safeSeverity = ISSUE_SEVERITIES.includes(severity) ? severity : 'blocker';
  const safeStage = isAllowedIssueStage(stage) ? stage : 'unknown';
  const blocking = safeSeverity === 'blocker' || safeSeverity === 'error';
  return {
    issueCode: safeCode,
    severity: safeSeverity,
    stage: safeStage,
    path: sanitizePath(path),
    message: deterministicMessage(safeCode),
    deterministic: true,
    blocksBuilder: blocking,
    blocksEnvelope: blocking,
    blocksRuntime: blocking,
    blocksPreviewSandbox: blocking,
  };
}

/** True iff the value has exactly the contract issue shape. */
export function hasExactIssueShape(issue) {
  if (!issue || typeof issue !== 'object') return false;
  const keys = Object.keys(issue);
  return keys.length === ISSUE_SHAPE_FIELDS.length && ISSUE_SHAPE_FIELDS.every((f) => Object.prototype.hasOwnProperty.call(issue, f));
}

/**
 * Deterministically normalizes an issue list: exact shape, dedupe by (issueCode+stage+path), stable ordering, and a
 * HARD cap at maxIssues — overflow is NOT truncated silently; the caller receives an explicit
 * BUILDER_LIMIT_EXCEEDED issue instead (see normalizeIssuesWithOverflow).
 */
export function normalizeIssues(issues) {
  const list = Array.isArray(issues) ? issues : [];
  const seen = new Set();
  const out = [];
  for (const it of list) {
    if (!it || typeof it !== 'object') continue;
    // EXACT contract field only — there is no `code` alias. An entry without a valid `issueCode` collapses
    // fail-closed to BUILDER_CONFIG_INVALID inside makeIssue rather than being silently reinterpreted.
    const iss = makeIssue(it.issueCode, it.stage, it.severity, it.path);
    const key = `${iss.issueCode}::${iss.stage}::${iss.path}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(iss);
  }
  out.sort((a, b) => (a.issueCode < b.issueCode ? -1 : a.issueCode > b.issueCode ? 1
    : (a.stage < b.stage ? -1 : a.stage > b.stage ? 1 : (a.path < b.path ? -1 : a.path > b.path ? 1 : 0))));
  return deepFreeze(out);
}

/**
 * Normalizes and enforces maxIssues fail-closed: if the deduped list exceeds the real limit, the result is a single
 * deterministic BUILDER_LIMIT_EXCEEDED issue — never a silent truncation of the caller's issues.
 */
export function normalizeIssuesWithOverflow(issues) {
  const normalized = normalizeIssues(issues);
  if (normalized.length > RESOURCE_LIMITS.maxIssues) {
    return deepFreeze([makeIssue('BUILDER_LIMIT_EXCEEDED', 'public_boundary', 'blocker', 'issues')]);
  }
  return normalized;
}
export default normalizeIssues;

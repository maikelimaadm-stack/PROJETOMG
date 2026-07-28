import { ISSUE_CODES, ISSUE_SEVERITIES, ISSUE_SHAPE_FIELDS, RESOURCE_LIMITS, PIPELINE_STAGES } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';

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
  const safeStage = (typeof stage === 'string' && (PIPELINE_STAGES.includes(stage) || /^[a-z_]{1,64}$/.test(stage))) ? stage : 'unknown';
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
    const iss = makeIssue(it.issueCode ?? it.code, it.stage, it.severity, it.path);
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
    return deepFreeze([makeIssue('BUILDER_LIMIT_EXCEEDED', 'issue_limit_enforcement', 'blocker', 'issues')]);
  }
  return normalized;
}
export default normalizeIssues;

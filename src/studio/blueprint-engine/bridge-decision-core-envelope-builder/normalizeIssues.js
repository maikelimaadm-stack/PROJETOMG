import { ISSUE_CODES, ISSUE_SEVERITIES, ISSUE_SHAPE_FIELDS, RESOURCE_LIMITS, PIPELINE_STAGES } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';

/**
 * INTERNAL, sanitized construction failure. Carries a fixed reason token only — never the offending value, a raw
 * message, a stack, a cause, the source decision, the config or an internal path. The public boundary converts it
 * into the single deterministic `BUILDER_UNEXPECTED_EXECUTION_FAILURE` rejection.
 */
export class BuilderIssueConstructionError extends Error {
  constructor(reason) {
    super('builder_issue_construction_failed');
    this.name = 'BuilderIssueConstructionError';
    this.reason = typeof reason === 'string' ? reason : 'unknown';
  }
}

/**
 * CLOSED stage allowlist: the 23 canonical pipeline stages plus the only two non-pipeline boundaries the builder
 * legitimately reports from — `config_normalization` (before the pipeline starts) and `public_boundary` (the public
 * API edge). There is NO pattern fallback and NO `unknown` bucket: a stage outside this list is a construction
 * failure, not a silently corrected value.
 */
export const ISSUE_STAGE_ALLOWLIST = deepFreeze([...PIPELINE_STAGES, 'config_normalization', 'public_boundary']);

/** True iff `stage` is one of the 25 allowed issue stages. */
export function isAllowedIssueStage(stage) {
  return typeof stage === 'string' && ISSUE_STAGE_ALLOWLIST.includes(stage);
}

/** A safe, deterministic, relative field path token. Never an absolute path, raw value or secret. */
export function isValidIssuePath(p) {
  return typeof p === 'string' && p.length > 0 && /^[A-Za-z0-9_.[\]]{1,120}$/.test(p) && !p.startsWith('/');
}

/** Deterministic, code-derived message. Never an exception message, stack, cause or raw value. */
function deterministicMessage(issueCode) {
  return `builder rejected: ${issueCode}`;
}

/**
 * Builds a single issue in the EXACT contract shape (10 fields):
 * issueCode, severity, stage, path, message, deterministic, blocksBuilder, blocksEnvelope, blocksRuntime,
 * blocksPreviewSandbox.
 *
 * STRICT, NO FALLBACK — the contract declares `silentCorrectionAllowed:false` and `permissiveFallbackAllowed:false`.
 * An unknown issue code, an unknown severity, a stage outside the allowlist or a supplied-but-invalid path THROWS
 * `BuilderIssueConstructionError`. Nothing is coerced, defaulted or downgraded. An OMITTED path stays `''`.
 */
export function makeIssue(issueCode, stage, severity = 'blocker', path = '') {
  if (!ISSUE_CODES.includes(issueCode)) throw new BuilderIssueConstructionError('unknown_issue_code');
  if (!ISSUE_SEVERITIES.includes(severity)) throw new BuilderIssueConstructionError('unknown_severity');
  if (!isAllowedIssueStage(stage)) throw new BuilderIssueConstructionError('stage_outside_allowlist');
  if (path !== '' && !isValidIssuePath(path)) throw new BuilderIssueConstructionError('invalid_path');
  const blocking = severity === 'blocker' || severity === 'error';
  return {
    issueCode,
    severity,
    stage,
    path,
    message: deterministicMessage(issueCode),
    deterministic: true,
    blocksBuilder: blocking,
    blocksEnvelope: blocking,
    blocksRuntime: blocking,
    blocksPreviewSandbox: blocking,
  };
}

/** True iff the value has exactly the contract issue shape. */
export function hasExactIssueShape(issue) {
  if (!issue || typeof issue !== 'object' || Array.isArray(issue)) return false;
  const keys = Object.keys(issue);
  return keys.length === ISSUE_SHAPE_FIELDS.length && ISSUE_SHAPE_FIELDS.every((f) => Object.prototype.hasOwnProperty.call(issue, f));
}

/**
 * Deterministically normalizes an issue list: EXACT shape only, dedupe by (issueCode+stage+path), stable ordering.
 *
 * FAIL-CLOSED — a non-object entry, an incomplete shape, an incompatible extra field, an invalid code / stage /
 * severity / path, or the undocumented `code` alias all THROW `BuilderIssueConstructionError`. Nothing is skipped,
 * ignored or silently corrected.
 */
export function normalizeIssues(issues) {
  if (!Array.isArray(issues)) throw new BuilderIssueConstructionError('issue_list_not_array');
  const seen = new Set();
  const out = [];
  for (const it of issues) {
    if (!it || typeof it !== 'object' || Array.isArray(it)) throw new BuilderIssueConstructionError('issue_not_object');
    if (Object.prototype.hasOwnProperty.call(it, 'code')) throw new BuilderIssueConstructionError('issue_code_alias_forbidden');
    if (!hasExactIssueShape(it)) throw new BuilderIssueConstructionError('issue_shape_incomplete_or_extended');
    // Rebuilt from the declared fields only — makeIssue re-validates code, severity, stage and path.
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

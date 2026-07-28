import { ISSUE_CODES, ISSUE_SEVERITIES, RESOURCE_LIMITS } from './builderConfig.js';
import { deepFreeze } from './deepFreeze.js';

/** Build a single sanitized issue. Only a known code, a stage and a severity — never a raw value/path/message. */
export function makeIssue(code, stage, severity = 'blocker') {
  const safeCode = ISSUE_CODES.includes(code) ? code : 'BUILDER_CONFIG_INVALID';
  const safeSeverity = ISSUE_SEVERITIES.includes(severity) ? severity : 'blocker';
  return { code: safeCode, stage: typeof stage === 'string' ? stage : 'unknown', severity: safeSeverity };
}

/**
 * Deterministically normalize an issue list: keep only sanitized fields, dedupe by (code+stage), sort by
 * (stage order in the pipeline is preserved by insertion — but final order is stable by code then stage), cap length.
 */
export function normalizeIssues(issues) {
  const list = Array.isArray(issues) ? issues : [];
  const seen = new Set();
  const out = [];
  for (const it of list) {
    if (!it || typeof it !== 'object') continue;
    const iss = makeIssue(it.code, it.stage, it.severity);
    const key = `${iss.code}::${iss.stage}`;
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(iss);
    if (out.length >= RESOURCE_LIMITS.maxIssues) break;
  }
  out.sort((a, b) => (a.code < b.code ? -1 : a.code > b.code ? 1 : (a.stage < b.stage ? -1 : a.stage > b.stage ? 1 : 0)));
  return deepFreeze(out);
}
export default normalizeIssues;

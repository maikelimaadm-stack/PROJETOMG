import { BRIDGE_VALIDATION_STAGES } from './bridgeRuntimeConfig.js';

const STAGE_ORDER = new Map(BRIDGE_VALIDATION_STAGES.map((s, i) => [s, i]));

/**
 * Deterministically sorts bridge issues by (stage order, path, issueCode, message). Pure — returns a new
 * array; never mutates the input. @param {Object[]} issues @returns {Object[]}
 */
export function sortBridgeIssues(issues) {
  const list = Array.isArray(issues) ? [...issues] : [];
  return list.sort((a, b) => {
    const sa = STAGE_ORDER.has(a.stage) ? STAGE_ORDER.get(a.stage) : BRIDGE_VALIDATION_STAGES.length;
    const sb = STAGE_ORDER.has(b.stage) ? STAGE_ORDER.get(b.stage) : BRIDGE_VALIDATION_STAGES.length;
    if (sa !== sb) return sa - sb;
    if (a.path !== b.path) return a.path < b.path ? -1 : 1;
    if (a.issueCode !== b.issueCode) return a.issueCode < b.issueCode ? -1 : 1;
    if (a.message !== b.message) return a.message < b.message ? -1 : 1;
    return 0;
  });
}

export default sortBridgeIssues;

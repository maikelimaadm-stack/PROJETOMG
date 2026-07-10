import {
  redactSensitive,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';

/** Ordered severities (ascending). */
export const DIFFERENCE_SEVERITIES = ['info', 'low', 'medium', 'high', 'critical'];

/** Allowed difference categories. */
export const DIFFERENCE_CATEGORIES = [
  'structure',
  'table',
  'form',
  'field',
  'validation',
  'permission',
  'action',
  'data-shape',
  'metadata',
  'diagnostics',
  'safety',
];

/** @param {string} severity */
export function severityRank(severity) {
  const i = DIFFERENCE_SEVERITIES.indexOf(severity);
  return i === -1 ? 0 : i;
}

/**
 * Builds a single normalized difference entry. `blocking` defaults to
 * `severity === 'critical'` but may be overridden. Sensitive values are masked.
 * @param {Object} spec
 * @param {string} spec.id
 * @param {string} spec.path
 * @param {string} spec.category
 * @param {string} spec.severity
 * @param {unknown} [spec.legacyValue]
 * @param {unknown} [spec.runtimeV2Value]
 * @param {string} spec.message
 * @param {string} [spec.recommendedAction]
 * @param {boolean} [spec.blocking]
 * @param {string} [spec.gate]
 * @returns {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadDifference}
 */
export function makeDifference(spec) {
  const severity = DIFFERENCE_SEVERITIES.includes(spec.severity) ? spec.severity : 'info';
  const category = DIFFERENCE_CATEGORIES.includes(spec.category) ? spec.category : 'metadata';
  const blocking = typeof spec.blocking === 'boolean' ? spec.blocking : severity === 'critical';
  return {
    id: String(spec.id),
    path: String(spec.path),
    category,
    severity,
    legacyValue: redactSensitive(safeClone(spec.legacyValue ?? null)),
    runtimeV2Value: redactSensitive(safeClone(spec.runtimeV2Value ?? null)),
    message: String(spec.message),
    recommendedAction: typeof spec.recommendedAction === 'string' ? spec.recommendedAction : 'review structural drift before advancing',
    blocking,
    gate: typeof spec.gate === 'string' ? spec.gate : 'gate:g423-empresas-dual-read',
  };
}

/**
 * Aggregates an ordered list of differences into a stable summary + parity
 * status. Order is stabilized by (severity desc, category, path, id).
 * @param {import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadDifference[]} differences
 * @returns {{ ordered: import('../../types/empresas-dual-read-shadow-compare.js').EmpresasReadDifference[], summary: import('../../types/empresas-dual-read-shadow-compare.js').DualReadSummary }}
 */
export function summarizeDifferences(differences) {
  const ordered = [...differences].sort((a, b) => {
    const bySeverity = severityRank(b.severity) - severityRank(a.severity);
    if (bySeverity !== 0) return bySeverity;
    if (a.category !== b.category) return a.category.localeCompare(b.category);
    if (a.path !== b.path) return a.path.localeCompare(b.path);
    return a.id.localeCompare(b.id);
  });
  const count = (sev) => ordered.filter((d) => d.severity === sev).length;
  const blockingCount = ordered.filter((d) => d.blocking).length;
  const criticalCount = count('critical');
  /** @type {'parity'|'acceptable_drift'|'blocked'} */
  let parityStatus;
  if (ordered.length === 0) parityStatus = 'parity';
  else if (criticalCount === 0 && blockingCount === 0) parityStatus = 'acceptable_drift';
  else parityStatus = 'blocked';

  return {
    ordered,
    summary: {
      totalDifferences: ordered.length,
      criticalCount,
      highCount: count('high'),
      mediumCount: count('medium'),
      lowCount: count('low'),
      infoCount: count('info'),
      blockingCount,
      parityStatus,
    },
  };
}

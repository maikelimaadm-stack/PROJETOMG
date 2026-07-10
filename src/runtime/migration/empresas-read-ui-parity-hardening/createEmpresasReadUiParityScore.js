import {
  isPlainObject,
  validateProjectionInput,
  safeClone,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadUiParityError } from './errors.js';

/** @param {string} code @param {string} message */
function scoreError(code, message) {
  return new EmpresasReadUiParityError(/** @type {any} */ (code), message);
}

/**
 * Computes the deterministic parity SCORE + readiness status from a checklist.
 *
 * Readiness:
 * - `skipped`            → every item skipped (flag off)
 * - `blocked`            → any critical fail OR any blocking item
 * - `needs_hardening`    → any non-critical fail
 * - `ready_for_next_slice` → all pass (warnings allowed)
 *
 * @param {Object} [options]
 * @param {import('../../types/empresas-read-ui-parity-hardening.js').ParityChecklistItem[]} [options.checklist]
 * @returns {import('../../types/empresas-read-ui-parity-hardening.js').ParityScore}
 */
export function createEmpresasReadUiParityScore(options = {}) {
  validateProjectionInput(options, 0, 'Empresas read UI parity score options', scoreError);
  if (!isPlainObject(options)) {
    throw scoreError('MAK-L3-EMP-PARITY-003', 'createEmpresasReadUiParityScore() options must be a plain object');
  }
  const checklist = Array.isArray(options.checklist) ? options.checklist : [];
  const totalItems = checklist.length;
  const passCount = checklist.filter((i) => i.status === 'pass').length;
  const warnCount = checklist.filter((i) => i.status === 'warn').length;
  const failCount = checklist.filter((i) => i.status === 'fail').length;
  const skippedCount = checklist.filter((i) => i.status === 'skipped').length;
  const blockingCount = checklist.filter((i) => i.status === 'fail' && i.blocking).length;
  const criticalCount = checklist.filter((i) => i.status === 'fail' && i.severity === 'critical').length;

  // Score percent over the gradeable (non-skipped) items; pass=1, warn=0.5, fail=0.
  const gradeable = totalItems - skippedCount;
  const scorePercent = gradeable > 0
    ? Math.round(((passCount + warnCount * 0.5) / gradeable) * 100)
    : 0;

  /** @type {'ready_for_next_slice'|'needs_hardening'|'blocked'|'skipped'} */
  let readinessStatus;
  if (totalItems > 0 && skippedCount === totalItems) readinessStatus = 'skipped';
  else if (criticalCount > 0 || blockingCount > 0) readinessStatus = 'blocked';
  else if (failCount > 0) readinessStatus = 'needs_hardening';
  else readinessStatus = 'ready_for_next_slice';

  const model = {
    kind: 'empresas-read-ui-parity-score',
    totalItems,
    passCount,
    warnCount,
    failCount,
    skippedCount,
    blockingCount,
    criticalCount,
    scorePercent,
    readinessStatus,
  };
  return /** @type {any} */ (safeClone(model));
}

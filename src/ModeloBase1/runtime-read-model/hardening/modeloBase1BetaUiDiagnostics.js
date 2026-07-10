import { isPlainObject, safeClone } from '../safety.js';

/**
 * Summarizes a beta UI hardening checklist into passive diagnostics: counts by
 * status, blocking failures, warnings, and a readiness verdict. Pure and
 * deterministic; never exposes raw rows or sensitive data.
 *
 * @param {Object} input
 * @param {string} [input.moduleId]
 * @param {Array<Object>} input.checklist
 * @param {import('../types.js').ModeloBase1RuntimeReadState} [input.state]
 * @returns {Object}
 */
export function createModeloBase1BetaUiDiagnostics(input = {}) {
  const o = isPlainObject(input) ? input : {};
  const checklist = Array.isArray(o.checklist) ? o.checklist : [];
  const state = isPlainObject(o.state) ? o.state : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : (typeof state.moduleId === 'string' ? state.moduleId : 'unknown');

  const counts = { pass: 0, warn: 0, fail: 0, skipped: 0 };
  const warnings = [];
  const blockers = [];
  for (const item of checklist) {
    const status = item && typeof item.status === 'string' ? item.status : 'skipped';
    counts[status] = (counts[status] ?? 0) + 1;
    if (status === 'warn') warnings.push(item.id);
    if (status === 'fail') {
      blockers.push(item.id);
    }
  }
  const blockingFailures = checklist.filter((i) => i && i.status === 'fail' && i.blocking === true).map((i) => i.id);

  // Ready when there is no blocking failure. Non-blocking warns are tolerated
  // (e.g. the known header/dataset column-vocabulary drift) and keep readiness.
  // When beta is not applied the state is the legacy fallback — reported as
  // 'fallback' (a neutral, healthy status), not 'needs_fixes'.
  const betaApplied = state.betaApplied === true;
  const hardeningStatus = blockingFailures.length > 0
    ? 'needs_fixes'
    : (betaApplied ? 'hardened' : 'fallback');

  return safeClone({
    kind: 'modelobase1-beta-ui-diagnostics',
    moduleId,
    betaApplied: state.betaApplied === true,
    fallbackApplied: state.fallbackApplied === true,
    fallbackReason: typeof state.fallbackReason === 'string' ? state.fallbackReason : null,
    writeBlocked: Boolean(state.writeBlocked),
    source: typeof state.source === 'string' ? state.source : null,
    counts,
    total: checklist.length,
    warnings,
    blockers,
    blockingFailures,
    hardeningStatus,
    noSideEffects: true,
    nextAllowedStep: 'ModeloBase1 Controlled Local Write Plan',
  });
}

export default createModeloBase1BetaUiDiagnostics;

import { isPlainObject, safeClone } from './safety.js';

/**
 * Builds passive, non-intrusive diagnostics for the ModeloBase1 runtime wiring.
 * Pure and deterministic; never exposes unmasked sensitive data (the resolved
 * payload it summarizes is validated/masked upstream). Reports only shapes and
 * flags — never raw rows.
 *
 * @param {Object} input
 * @param {string|null} [input.moduleId]
 * @param {boolean} [input.present]
 * @param {boolean} [input.enabled]
 * @param {boolean} [input.valid]
 * @param {boolean} [input.betaApplied]
 * @param {boolean} [input.fallbackApplied]
 * @param {string|null} [input.fallbackReason]
 * @param {boolean} [input.tableApplied]
 * @param {boolean} [input.formApplied]
 * @param {boolean} [input.writeBlocked]
 * @param {object|null} [input.table]
 * @param {object|null} [input.form]
 * @param {string[]} [input.warnings]
 * @param {string[]} [input.blockers]
 * @returns {object}
 */
export function createModeloBase1RuntimeReadDiagnostics(input = {}) {
  const o = isPlainObject(input) ? input : {};
  const table = isPlainObject(o.table) ? o.table : null;
  const form = isPlainObject(o.form) ? o.form : null;
  return safeClone({
    kind: 'modelobase1-runtime-read-diagnostics',
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    flagStatus: o.enabled ? 'on' : 'off',
    runtimeReadModelPresent: Boolean(o.present),
    runtimeReadModelValid: Boolean(o.valid),
    betaApplied: Boolean(o.betaApplied),
    fallbackApplied: Boolean(o.fallbackApplied),
    fallbackReason: typeof o.fallbackReason === 'string' ? o.fallbackReason : null,
    tableApplied: Boolean(o.tableApplied),
    formApplied: Boolean(o.formApplied),
    writeBlocked: Boolean(o.writeBlocked),
    columnCount: table && Array.isArray(table.columns) ? table.columns.length : 0,
    rowCount: table && typeof table.rowCount === 'number' ? table.rowCount : (table && Array.isArray(table.rows) ? table.rows.length : 0),
    fieldCount: form && Array.isArray(form.fields) ? form.fields.length : 0,
    warnings: Array.isArray(o.warnings) ? o.warnings.map(String) : [],
    blockers: Array.isArray(o.blockers) ? o.blockers.map(String) : [],
    noSideEffects: true,
    protectedScopes: {
      backend: 'untouched',
      prisma: 'untouched',
      runtimeBridge: 'untouched',
      otherScreens: 'untouched',
      write: 'blocked',
    },
  });
}

export default createModeloBase1RuntimeReadDiagnostics;

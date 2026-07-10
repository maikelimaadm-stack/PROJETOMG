import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

/**
 * Converts a GENERIC MODEL READ MODEL back into a ModeloBase1-compatible read
 * state shape ({ moduleId, table:{columns,visibleColumns,rows,rowCount},
 * form:{fields,visibleFields}, writeBlocked, betaApplied, source }). Preserves
 * the shape the ModeloBase1 engine expects. Pure; never mutates the input. When
 * the generic read model is missing, returns a safe read-only fallback state.
 *
 * @param {Object} [options]
 * @param {Object} [options.readModel] A GenericModelReadModel.
 * @param {boolean} [options.writeBlocked] Default true (read-only).
 * @returns {Object} ModeloBase1-compatible state
 */
export function mapGenericModelReadToModeloBase1State(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const rm = isGenericModelPlainObject(o.readModel) ? o.readModel : null;
  const writeBlocked = o.writeBlocked !== false;

  if (!rm) {
    return safeCloneGenericModel({
      kind: 'modelobase1-runtime-read-state',
      moduleId: null,
      betaApplied: false,
      writeBlocked,
      source: 'legacy',
      table: { columns: [], visibleColumns: [], rows: [], rowCount: 0 },
      form: { fields: [], visibleFields: [] },
      fallbackApplied: true,
      fallbackReason: 'generic-read-model-absent',
    });
  }

  const table = isGenericModelPlainObject(rm.table) ? rm.table : { columns: [], rows: [] };
  const columns = Array.isArray(table.columns) ? table.columns : [];
  const rows = Array.isArray(table.rows) ? table.rows : [];
  const form = isGenericModelPlainObject(rm.form) ? rm.form : { fields: [] };
  const fields = Array.isArray(form.fields) ? form.fields : [];

  return safeCloneGenericModel({
    kind: 'modelobase1-runtime-read-state',
    moduleId: typeof rm.moduleId === 'string' ? rm.moduleId : null,
    betaApplied: Boolean(rm.diagnostics?.betaApplied),
    writeBlocked,
    source: typeof rm.source === 'string' ? rm.source : 'generic-model-local',
    table: { columns, visibleColumns: columns, rows, rowCount: rows.length },
    form: { fields, visibleFields: fields },
    fallbackApplied: false,
    fallbackReason: null,
  });
}

export default mapGenericModelReadToModeloBase1State;

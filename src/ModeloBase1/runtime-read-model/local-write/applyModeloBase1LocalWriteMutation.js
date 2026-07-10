import { isPlainObject, safeClone } from '../safety.js';
import { localWriteError } from './errors.js';

/**
 * Applies ONE local mutation to a SAFE COPY of a draft (never the original).
 * Pure, deterministic, in-memory only. It never persists, never calls a backend/
 * Prisma/fetch/storage, never touches the runtime bridge. Returns a structured
 * result plus the next draft. Row identity uses a deterministic local id
 * `local-<moduleId>-<sequence>` so repeated calls with the same inputs are
 * reproducible.
 *
 * @param {Object} options
 * @param {Object} options.draft A plain draft (safe copy) with `table.rows`.
 * @param {string} options.operation createRow|updateRow|deleteRow|saveDraft|submitDraft
 * @param {Object} [options.payload]
 * @param {string} [options.moduleId]
 * @param {number} [options.sequence] Monotonic counter for deterministic local ids.
 * @returns {Object}
 */
export function applyModeloBase1LocalWriteMutation(options = {}) {
  if (!isPlainObject(options)) {
    throw localWriteError('MAK-MB1-LW-001', 'applyModeloBase1LocalWriteMutation() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : 'unknown';
  const operation = options.operation;
  const payload = isPlainObject(options.payload) ? options.payload : {};
  const sequence = Number.isFinite(options.sequence) ? Number(options.sequence) : 1;

  const base = isPlainObject(options.draft) ? options.draft : {};
  const next = /** @type {any} */ (safeClone(base)) ?? {};
  if (!isPlainObject(next.table)) next.table = { columns: [], rows: [], rowCount: 0 };
  if (!Array.isArray(next.table.rows)) next.table.rows = [];

  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  let applied = false;

  const result = (extra = {}) => ({
    ok: applied && errors.length === 0,
    operation,
    moduleId,
    applied,
    localOnly: true,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    nextDraft: next,
    errors,
    warnings,
    ...extra,
  });

  switch (operation) {
    case 'createRow': {
      const localId = `local-${moduleId}-${sequence}`;
      const cells = isPlainObject(payload.cells) ? payload.cells : payload;
      next.table.rows.push({ id: localId, cells: safeClone(cells) ?? {}, _local: true, _op: 'created' });
      next.table.rowCount = next.table.rows.length;
      applied = true;
      return result({ localId, draftRowCount: next.table.rowCount });
    }
    case 'updateRow': {
      const id = payload.id;
      const idx = next.table.rows.findIndex((r) => r && r.id === id);
      if (idx < 0) {
        errors.push(`updateRow: row "${String(id)}" not found`);
        return result({ code: 'MAK-MB1-LW-008' });
      }
      const cells = isPlainObject(payload.cells) ? payload.cells : {};
      next.table.rows[idx] = { ...next.table.rows[idx], cells: { ...(next.table.rows[idx].cells ?? {}), ...safeClone(cells) }, _op: 'updated' };
      applied = true;
      return result({ updatedId: id });
    }
    case 'deleteRow': {
      const id = payload.id;
      const idx = next.table.rows.findIndex((r) => r && r.id === id);
      if (idx < 0) {
        errors.push(`deleteRow: row "${String(id)}" not found`);
        return result({ code: 'MAK-MB1-LW-008' });
      }
      // Soft, reversible local delete (kept in the draft, flagged).
      next.table.rows[idx] = { ...next.table.rows[idx], _localDeleted: true, _op: 'deleted' };
      next.table.rowCount = next.table.rows.filter((r) => !r._localDeleted).length;
      applied = true;
      return result({ deletedId: id });
    }
    case 'saveDraft': {
      applied = true;
      return result({ savedLocally: true, draftRowCount: next.table.rows.length });
    }
    case 'submitDraft': {
      applied = true;
      // No send — a simulated submit only.
      return result({ simulatedSubmit: true, sent: false, draftRowCount: next.table.rows.length });
    }
    default: {
      errors.push(`unknown local mutation "${String(operation)}"`);
      return result({ code: 'MAK-MB1-LW-004' });
    }
  }
}

export default applyModeloBase1LocalWriteMutation;

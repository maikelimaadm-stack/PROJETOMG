import { isPlainObject, safeClone } from '../../safety.js';
import { validateModeloBase1LocalDraftSnapshot } from './validateModeloBase1LocalDraftSnapshot.js';

/**
 * Rehydrates a validated ModeloBase1 local draft SNAPSHOT back into a safe draft
 * shape ({ table:{columns,rows,rowCount}, form }). It validates first and
 * REFUSES to rehydrate an invalid/unsafe/mismatched snapshot. It never mutates
 * the snapshot, never executes a function/handler, never mounts a React element,
 * never calls a backend/Prisma/fetch/storage. Returns a structured result.
 *
 * @param {Object} [options]
 * @param {Object} [options.snapshot]
 * @param {string} [options.moduleId] Expected moduleId (optional).
 * @returns {{ ok: boolean, draft: Object|null, rows: Array<Object>, form: Object|null, diagnostics: Object, errors: string[], warnings: string[] }}
 */
export function rehydrateModeloBase1LocalDraft(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const snapshot = isPlainObject(o.snapshot) ? o.snapshot : null;

  const validation = validateModeloBase1LocalDraftSnapshot({ snapshot, moduleId: o.moduleId });
  const baseDiag = {
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    localOnly: true,
    validation: { valid: validation.valid, score: validation.score },
  };

  if (!validation.safeToRehydrate) {
    return {
      ok: false,
      draft: null,
      rows: [],
      form: null,
      diagnostics: baseDiag,
      errors: [...validation.errors, ...validation.blockers],
      warnings: validation.warnings,
    };
  }

  // Build a safe draft from a COPY of the snapshot (snapshot is never mutated).
  const rows = /** @type {any} */ (safeClone(snapshot.rows)) ?? [];
  const form = snapshot.form ? /** @type {any} */ (safeClone(snapshot.form)) : null;
  const draft = safeClone({
    kind: 'modelobase1-local-draft',
    moduleId: snapshot.moduleId,
    table: { columns: [], rows, rowCount: rows.length },
    form,
    rehydratedFrom: snapshot.snapshotId,
    localOnly: true,
    persistenceReal: false,
  });

  return {
    ok: true,
    draft,
    rows,
    form,
    diagnostics: baseDiag,
    errors: [],
    warnings: validation.warnings,
  };
}

export default rehydrateModeloBase1LocalDraft;

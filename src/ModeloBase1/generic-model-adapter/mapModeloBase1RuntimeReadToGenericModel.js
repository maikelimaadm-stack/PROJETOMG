import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  sanitizeGenericModelPayload,
  validateGenericModelReadModel,
  createGenericModelReadContract,
  createGenericModelFallback,
} from '../../runtime/generic-model/index.js';

export const MODELOBASE1_MODEL_ID = 'modelobase1';
export const MODELOBASE1_MODEL_TYPE = 'cadastro';

/**
 * Converts a ModeloBase1 runtime read state into a GENERIC MODEL READ MODEL,
 * validates it with the generic kernel, and returns a fallback when invalid.
 * Pure; never mutates the input. Never touches a backend/Prisma/fetch.
 *
 * @param {Object} [options]
 * @param {Object} [options.runtimeReadModel] The applied ModeloBase1 read state.
 * @param {string} [options.moduleId]
 * @param {string} [options.source]
 * @returns {{ ok: boolean, readModel: Object|null, readContract: Object, validation: Object, fallback: Object|null, errors: string[], warnings: string[] }}
 */
export function mapModeloBase1RuntimeReadToGenericModel(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const rs = isGenericModelPlainObject(o.runtimeReadModel) ? o.runtimeReadModel : null;
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : (rs && typeof rs.moduleId === 'string' ? rs.moduleId : 'unknown');
  const source = typeof o.source === 'string' ? o.source : (rs && typeof rs.source === 'string' ? rs.source : 'structural-only');

  const readContract = createGenericModelReadContract({ modelId: MODELOBASE1_MODEL_ID, moduleId, modelType: MODELOBASE1_MODEL_TYPE, enabled: Boolean(rs && rs.betaApplied) });

  if (!rs) {
    const fallback = createGenericModelFallback({ modelId: MODELOBASE1_MODEL_ID, moduleId, operation: 'mapRead', reason: 'runtime-read-model-absent', source: 'legacy' });
    return { ok: false, readModel: null, readContract, validation: { valid: false }, fallback, errors: ['runtime read model absent'], warnings: [] };
  }

  // Sanitize the table/form payload (drops functions/React, masks sensitive).
  const sanitized = sanitizeGenericModelPayload({ payload: { table: rs.table ?? null, form: rs.form ?? null }, label: 'ModeloBase1 read payload' });
  const safeTableForm = isGenericModelPlainObject(sanitized.sanitized) ? sanitized.sanitized : { table: null, form: null };

  const readModel = safeCloneGenericModel({
    modelId: MODELOBASE1_MODEL_ID,
    moduleId,
    modelType: MODELOBASE1_MODEL_TYPE,
    source,
    table: isGenericModelPlainObject(safeTableForm.table)
      ? { columns: Array.isArray(safeTableForm.table.columns) ? safeTableForm.table.columns : [], rows: Array.isArray(safeTableForm.table.rows) ? safeTableForm.table.rows : [] }
      : null,
    form: isGenericModelPlainObject(safeTableForm.form)
      ? { fields: Array.isArray(safeTableForm.form.fields) ? safeTableForm.form.fields : [] }
      : null,
    diagnostics: { betaApplied: rs.betaApplied === true, writeBlocked: rs.writeBlocked === true },
    safety: { readOnly: true, usesRealData: false, noSideEffects: true },
    fallback: { available: true },
  });

  const validation = validateGenericModelReadModel({ readModel, modelId: MODELOBASE1_MODEL_ID, moduleId });
  return {
    ok: validation.valid,
    readModel: validation.valid ? readModel : null,
    readContract,
    validation,
    fallback: validation.valid ? null : validation.fallback,
    errors: validation.errors ?? [],
    warnings: [...(validation.warnings ?? []), ...(sanitized.warnings ?? [])],
  };
}

export default mapModeloBase1RuntimeReadToGenericModel;

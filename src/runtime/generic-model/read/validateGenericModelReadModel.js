import { isGenericModelPlainObject } from '../safety/assertGenericModelPlainObject.js';
import { detectGenericModelUnsafeMarkers } from '../safety/detectGenericModelUnsafeMarkers.js';
import { createGenericModelFallback } from '../fallback/createGenericModelFallback.js';
import { GENERIC_MODEL_TYPES, GENERIC_MODEL_SAFE_SOURCES } from '../contracts/genericModelContractConstants.js';

/**
 * Validates a Generic Model READ MODEL. Coherence checks on table/form (optional
 * but well-formed when present), safety scan (no function/handler/React/pollution/
 * forbidden target), source allow-list, and model type. When invalid it returns a
 * FALLBACK so the caller keeps a safe render. Pure.
 *
 * @param {Object} [options]
 * @param {Object} [options.readModel]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @returns {{ valid: boolean, errors: string[], warnings: string[], blockers: string[], fallback: Object|null }}
 */
export function validateGenericModelReadModel(options = {}) {
  /** @type {string[]} */ const errors = [];
  /** @type {string[]} */ const warnings = [];
  /** @type {string[]} */ const blockers = [];

  const o = isGenericModelPlainObject(options) ? options : {};
  const rm = isGenericModelPlainObject(o.readModel) ? o.readModel : null;

  const withFallback = () => createGenericModelFallback({
    modelId: rm?.modelId ?? o.modelId,
    moduleId: rm?.moduleId ?? o.moduleId,
    operation: 'validateReadModel',
    reason: 'invalid-read-model',
    source: 'legacy',
  });

  if (!rm) {
    return { valid: false, errors: ['read model is missing or not a plain object'], warnings, blockers, fallback: withFallback() };
  }

  if (typeof rm.modelId !== 'string') errors.push('missing modelId');
  if (typeof rm.moduleId !== 'string') errors.push('missing moduleId');
  if (o.modelId && rm.modelId !== o.modelId) blockers.push(`modelId mismatch: expected "${o.modelId}"`);
  if (o.moduleId && rm.moduleId !== o.moduleId) blockers.push(`moduleId mismatch: expected "${o.moduleId}"`);
  if (rm.modelType && !GENERIC_MODEL_TYPES.includes(rm.modelType)) warnings.push(`unknown modelType "${rm.modelType}"`);
  if (rm.source && !GENERIC_MODEL_SAFE_SOURCES.includes(rm.source)) warnings.push(`source "${rm.source}" not in the safe allow-list`);

  // table/form optional but must be coherent when present.
  if (rm.table !== undefined) {
    if (!isGenericModelPlainObject(rm.table)) blockers.push('table must be a plain object');
    else if (rm.table.columns !== undefined && !Array.isArray(rm.table.columns)) blockers.push('table.columns must be an array');
    else if (rm.table.rows !== undefined && !Array.isArray(rm.table.rows)) blockers.push('table.rows must be an array');
  }
  if (rm.form !== undefined) {
    if (!isGenericModelPlainObject(rm.form)) blockers.push('form must be a plain object');
    else if (rm.form.fields !== undefined && !Array.isArray(rm.form.fields)) blockers.push('form.fields must be an array');
  }

  // Safety scan (functions/handlers/React/pollution/forbidden targets).
  const report = detectGenericModelUnsafeMarkers({ table: rm.table ?? null, form: rm.form ?? null, actions: rm.actions ?? null });
  if (report.unsafeMarkers.length > 0) blockers.push(...report.unsafeMarkers.map((m) => `unsafe:${m}`));
  if (report.sensitiveKeys.length > 0) blockers.push(...report.sensitiveKeys.map((k) => `unmasked-sensitive:${k}`));
  if (report.forbiddenTargets.length > 0) blockers.push(...report.forbiddenTargets.map((t) => `forbidden:${t}`));

  const valid = errors.length === 0 && blockers.length === 0;
  return { valid, errors, warnings, blockers, fallback: valid ? null : withFallback() };
}

export default validateGenericModelReadModel;

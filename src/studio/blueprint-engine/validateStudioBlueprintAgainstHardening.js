import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { evaluateStudioField } from '../foundation-contracts/hardening/index.js';

/**
 * Validates a blueprint's fields against the CERTIFIED Studio hardening baseline
 * (`evaluateStudioField` from the hardening subtree). Pure. Consumes the certified
 * matrix read-only; it does not re-implement it. Every field that the certified matrix
 * blocks is reported with its reasons. Never a side effect.
 *
 * @param {Object} [blueprint]
 * @returns {Object} hardening result
 */
export function validateStudioBlueprintAgainstHardening(blueprint = {}) {
  const b = isGenericModelPlainObject(blueprint) ? blueprint : {};
  const fields = Array.isArray(b.fields) ? b.fields.filter(isGenericModelPlainObject) : [];

  /** @type {{ field: string, reasons: string[] }[]} */ const blockedFields = [];
  const knownNames = [];
  let evaluated = 0;
  for (const f of fields) {
    const res = evaluateStudioField(f, { knownNames: [...knownNames] });
    evaluated += 1;
    if (typeof f.name === 'string') knownNames.push(f.name);
    if (res && res.valid === false) blockedFields.push({ field: String(f.name ?? '(unnamed)'), reasons: Array.isArray(res.reasons) ? res.reasons : [] });
  }

  const passed = blockedFields.length === 0;
  return safeCloneGenericModel({
    kind: 'studio-blueprint-hardening-validation',
    passed,
    evaluatedFieldCount: evaluated,
    blockedFieldCount: blockedFields.length,
    blockedFields,
    hardeningBaselineConsumed: true,
    readiness: passed ? 'hardening_valid' : 'hardening_violation',
  });
}

export default validateStudioBlueprintAgainstHardening;

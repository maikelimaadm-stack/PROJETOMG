import { isPlainObject, findUnsafeContent, hasUnmaskedSensitive, hasForbiddenReference } from './safety.js';

/**
 * The write-shaped operations that MUST be blocked while a runtime read model is
 * applied (read-only beta). Used to assert the descriptor's guard blocks them.
 */
export const REQUIRED_BLOCKED_WRITE_OPERATIONS = [
  'create',
  'update',
  'delete',
  'save',
  'submit',
  'bulkCreate',
  'bulkUpdate',
  'bulkDelete',
  'executeAction',
  'startWorkflow',
  'invokeConnector',
];

/**
 * Validates the runtime read-model DESCRIPTOR contract before the engine trusts
 * it. Confirms it is a read-only, write-blocked, non-real-data descriptor that
 * can materialize a view model. Does NOT execute anything.
 *
 * A valid descriptor has: `moduleId`, `moduleName`, `readOnly === true`,
 * `injectedAt`, a `resolve()` function, a write guard (`writeGuard.attempt`) OR
 * `writeActionsBlocked === true`, `usesRealData !== true`, and a `source`.
 *
 * @param {unknown} readModel
 * @returns {import('./types.js').ModeloBase1RuntimeReadValidation}
 */
export function validateModeloBase1RuntimeReadModel(readModel) {
  /** @type {string[]} */
  const reasons = [];
  let code = null;

  if (!isPlainObject(readModel)) {
    return { valid: false, reasons: ['read model is not a plain object'], code: 'MAK-MB1-RW-004' };
  }
  if (readModel.enabled === false) {
    return { valid: false, reasons: ['read model is disabled'], code: 'MAK-MB1-RW-003' };
  }
  if (typeof readModel.moduleId !== 'string' || readModel.moduleId.length === 0) {
    reasons.push('missing moduleId');
  }
  if (typeof readModel.moduleName !== 'string' || readModel.moduleName.length === 0) {
    reasons.push('missing moduleName');
  }
  if (readModel.readOnly !== true) {
    reasons.push('readOnly must be true');
  }
  if (typeof readModel.injectedAt !== 'string') {
    reasons.push('missing injectedAt');
  }
  if (typeof readModel.source !== 'string' || readModel.source.length === 0) {
    reasons.push('missing source/mode');
  }
  if (typeof readModel.resolve !== 'function') {
    reasons.push('missing resolve() to materialize the view model');
  }
  if (readModel.usesRealData === true) {
    reasons.push('read model must not use real data');
    code = code ?? 'MAK-MB1-RW-008';
  }

  // Read-only invariant: a write guard that blocks the standard write surface,
  // or an explicit writeActionsBlocked flag.
  const guard = readModel.writeGuard;
  const hasGuard = isPlainObject(guard) && typeof guard.attempt === 'function';
  if (hasGuard) {
    for (const op of REQUIRED_BLOCKED_WRITE_OPERATIONS) {
      let blocked = false;
      try {
        const res = guard.attempt(op, {});
        blocked = isPlainObject(res) && res.blocked === true && res.ok === false;
      } catch {
        blocked = false;
      }
      if (!blocked) {
        reasons.push(`write guard does not block "${op}"`);
        code = code ?? 'MAK-MB1-RW-006';
        break;
      }
    }
  } else if (readModel.writeActionsBlocked !== true) {
    reasons.push('missing write guard and writeActionsBlocked !== true');
    code = code ?? 'MAK-MB1-RW-006';
  }

  // The descriptor itself must not smuggle unsafe data (functions live only on
  // the sanctioned `resolve`/`writeGuard`; everything else must be pure).
  const { resolve, writeGuard, ...dataOnly } = /** @type {any} */ (readModel);
  const unsafe = findUnsafeContent(dataOnly);
  if (unsafe) {
    reasons.push(unsafe);
    code = code ?? 'MAK-MB1-RW-005';
  }
  if (hasForbiddenReference(dataOnly)) {
    reasons.push('descriptor references backend/fetch/Prisma/storage');
    code = code ?? 'MAK-MB1-RW-008';
  }

  const valid = reasons.length === 0;
  return { valid, reasons, code: valid ? null : (code ?? 'MAK-MB1-RW-004') };
}

/**
 * Validates a RESOLVED read payload (table/form/diagnostics) before the engine
 * applies it: it must be pure/serializable (no functions/handlers/React
 * elements), free of prototype pollution, free of unmasked sensitive values, and
 * free of forbidden backend/fetch/Prisma/storage references.
 *
 * @param {unknown} payload
 * @returns {import('./types.js').ModeloBase1RuntimeReadValidation}
 */
export function validateModeloBase1RuntimeReadPayload(payload) {
  /** @type {string[]} */
  const reasons = [];
  let code = null;
  if (!isPlainObject(payload)) {
    return { valid: false, reasons: ['resolved payload is not a plain object'], code: 'MAK-MB1-RW-005' };
  }
  const { writeGuard, ...dataOnly } = /** @type {any} */ (payload);
  const unsafe = findUnsafeContent(dataOnly);
  if (unsafe) {
    reasons.push(unsafe);
    code = 'MAK-MB1-RW-005';
  }
  if (hasUnmaskedSensitive(dataOnly)) {
    reasons.push('resolved payload has unmasked sensitive values');
    code = code ?? 'MAK-MB1-RW-005';
  }
  if (hasForbiddenReference(dataOnly)) {
    reasons.push('resolved payload references backend/fetch/Prisma/storage');
    code = code ?? 'MAK-MB1-RW-008';
  }
  const valid = reasons.length === 0;
  return { valid, reasons, code: valid ? null : code };
}

export default validateModeloBase1RuntimeReadModel;

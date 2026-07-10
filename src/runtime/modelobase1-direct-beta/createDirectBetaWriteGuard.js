import {
  isPlainObject,
  validateProjectionInput,
} from '../shadow/pilots/tableFormProjection.js';
import { ModeloBase1DirectBetaError, directBetaError } from './errors.js';

/**
 * Every write-shaped operation a ModeloBase1 beta screen could conceivably
 * perform. In this read-only beta ALL of them are blocked — there is no code
 * path that mutates anything.
 * @type {string[]}
 */
export const BLOCKED_BETA_WRITE_OPERATIONS = [
  'create',
  'update',
  'delete',
  'bulkCreate',
  'bulkUpdate',
  'bulkDelete',
  'save',
  'submit',
  'executeAction',
  'startWorkflow',
  'invokeConnector',
];

/** @param {string} code @param {string} message */
function guardError(code, message) {
  return directBetaError(/** @type {any} */ (code), message);
}

/**
 * A generic READ-ONLY write guard for ModeloBase1 direct beta screens that do
 * not have their own dedicated guard (e.g. Campos Personalizados). Every
 * write-shaped operation returns a structured, blocked result with a stable
 * code. It NEVER performs the operation, never calls the backend, never touches
 * real data.
 *
 * Code resolution order for a blocked result:
 *   1. flag disabled                    → MAK-L3-MB1-BETA-001
 *   2. production-blocked (fail-closed)  → MAK-L3-MB1-BETA-002
 *   3. prototype-pollution in payload    → MAK-L3-MB1-BETA-007
 *   4. unknown/invalid operation         → MAK-L3-MB1-BETA-004
 *   5. otherwise (a real write op)       → MAK-L3-MB1-BETA-003
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.enabled]
 * @param {boolean} [options.productionBlocked]
 * @returns {import('../types/modelobase1-direct-beta.js').BetaWriteGuard}
 */
export function createDirectBetaWriteGuard(options = {}) {
  const moduleId = isPlainObject(options) && typeof options.moduleId === 'string' ? options.moduleId : 'unknown';
  const enabled = isPlainObject(options) ? Boolean(options.enabled) : false;
  const productionBlocked = isPlainObject(options) ? Boolean(options.productionBlocked) : false;

  /**
   * @param {string} operation
   * @param {unknown} [payload]
   * @returns {import('../types/modelobase1-direct-beta.js').BetaWriteGuardResult}
   */
  function attempt(operation, payload) {
    const op = typeof operation === 'string' ? operation : String(operation);
    let pollution = false;
    try {
      validateProjectionInput(payload, 0, `${moduleId} direct-beta write payload for "${op}"`, guardError);
    } catch (err) {
      if (err instanceof ModeloBase1DirectBetaError) pollution = true;
      else throw err;
    }

    let code;
    let reason;
    if (!enabled && !productionBlocked) {
      code = 'MAK-L3-MB1-BETA-001';
      reason = 'direct beta flag disabled — no operation permitted';
    } else if (productionBlocked) {
      code = 'MAK-L3-MB1-BETA-002';
      reason = 'production blocked — direct beta fails closed in production';
    } else if (pollution) {
      code = 'MAK-L3-MB1-BETA-007';
      reason = 'prototype pollution blocked in write payload';
    } else if (!BLOCKED_BETA_WRITE_OPERATIONS.includes(op)) {
      code = 'MAK-L3-MB1-BETA-004';
      reason = `invalid operation "${op}" — not a recognized write operation`;
    } else {
      code = 'MAK-L3-MB1-BETA-003';
      reason = `write operation "${op}" is blocked — ModeloBase1 direct beta is read-only in this phase`;
    }
    return { ok: false, blocked: true, operation: op, code, reason };
  }

  return {
    kind: 'modelobase1-direct-beta-write-guard',
    moduleId,
    enabled,
    productionBlocked,
    readOnly: true,
    blockedOperations: [...BLOCKED_BETA_WRITE_OPERATIONS],
    blockedOperationCount: BLOCKED_BETA_WRITE_OPERATIONS.length,
    attempt,
  };
}

export default createDirectBetaWriteGuard;

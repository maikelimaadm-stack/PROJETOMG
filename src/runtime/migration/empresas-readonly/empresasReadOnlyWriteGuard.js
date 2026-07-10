import {
  isPlainObject,
  validateProjectionInput,
} from '../../shadow/pilots/tableFormProjection.js';
import { EmpresasReadOnlyError } from './errors.js';
import {
  isEmpresasReadOnlyEnabled,
  isEmpresasReadOnlyProductionBlocked,
} from './empresasReadOnlyConfig.js';

/**
 * Every write-shaped operation the Empresas module could conceivably perform.
 * In this read-only candidate ALL of them are blocked — there is no code path
 * that mutates anything.
 * @type {string[]}
 */
export const BLOCKED_WRITE_OPERATIONS = [
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
  return new EmpresasReadOnlyError(/** @type {any} */ (code), message);
}

/**
 * The Empresas read-only WRITE GUARD. It makes any write in runtime v2 for
 * Empresas impossible in this slice: every write-shaped operation returns a
 * structured, blocked result with a stable code. It NEVER performs the
 * operation, never calls the backend, never touches real data.
 *
 * Resolution order for a blocked result's code:
 *   1. flag disabled                    → MAK-L3-EMP-READONLY-001
 *   2. production-blocked (fail-closed)  → MAK-L3-EMP-READONLY-002
 *   3. prototype-pollution in payload    → MAK-L3-EMP-READONLY-007
 *   4. unknown/invalid operation         → MAK-L3-EMP-READONLY-004
 *   5. otherwise (a real write op)       → MAK-L3-EMP-READONLY-003
 *
 * @param {Object} [options]
 * @param {Record<string, unknown>} [options.env]
 * @returns {import('../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyWriteGuard}
 */
export function createEmpresasReadOnlyWriteGuard(options = {}) {
  const env = isPlainObject(options) ? options.env : undefined;
  const enabled = isEmpresasReadOnlyEnabled(env);
  const productionBlocked = isEmpresasReadOnlyProductionBlocked(env);

  /**
   * Attempt a write — always blocked. Returns a structured result; never throws
   * for a normal blocked write (only prototype pollution in the payload throws,
   * to match the pilots' hard-guard behavior, and is ALSO reflected in code 007
   * when invoked via `attempt`).
   * @param {string} operation
   * @param {unknown} [payload]
   * @returns {import('../../types/empresas-readonly-runtime-v2.js').WriteGuardResult}
   */
  function attempt(operation, payload) {
    const op = typeof operation === 'string' ? operation : String(operation);
    // Payload safety — pollution is blocked before anything else touches it.
    let pollution = false;
    try {
      validateProjectionInput(payload, 0, `Empresas read-only write payload for "${op}"`, guardError);
    } catch (err) {
      if (err instanceof EmpresasReadOnlyError) pollution = true;
      else throw err;
    }

    let code;
    let reason;
    if (!enabled && !productionBlocked) {
      code = 'MAK-L3-EMP-READONLY-001';
      reason = 'read-only candidate flag disabled — no operation permitted';
    } else if (productionBlocked) {
      code = 'MAK-L3-EMP-READONLY-002';
      reason = 'production blocked — read-only candidate fails closed in production';
    } else if (pollution) {
      code = 'MAK-L3-EMP-READONLY-007';
      reason = 'prototype pollution blocked in write payload';
    } else if (!BLOCKED_WRITE_OPERATIONS.includes(op)) {
      code = 'MAK-L3-EMP-READONLY-004';
      reason = `invalid operation "${op}" — not a recognized write operation`;
    } else {
      code = 'MAK-L3-EMP-READONLY-003';
      reason = `write operation "${op}" is blocked — runtime v2 Empresas is read-only in this slice`;
    }

    return { ok: false, blocked: true, operation: op, code, reason };
  }

  return {
    kind: 'empresas-readonly-write-guard',
    enabled,
    productionBlocked,
    readOnly: true,
    blockedOperations: [...BLOCKED_WRITE_OPERATIONS],
    blockedOperationCount: BLOCKED_WRITE_OPERATIONS.length,
    attempt,
  };
}

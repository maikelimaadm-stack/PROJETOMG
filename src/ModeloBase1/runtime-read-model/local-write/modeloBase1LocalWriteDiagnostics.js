import { isPlainObject, safeClone } from '../safety.js';
import { LOCAL_WRITE_ALLOWED_OPERATIONS, LOCAL_WRITE_BLOCKED_OPERATIONS } from './createModeloBase1LocalWriteContract.js';

/**
 * Builds passive diagnostics for the ModeloBase1 controlled local write plan.
 * Pure, deterministic; never exposes raw rows or sensitive data — only counts,
 * flags and the last operation's metadata.
 *
 * @param {Object} [input]
 * @param {string} [input.moduleId]
 * @param {boolean} [input.enabled]
 * @param {boolean} [input.ready]
 * @param {Object|null} [input.lastOperation]
 * @param {string[]} [input.warnings]
 * @param {string[]} [input.blockers]
 * @returns {Object}
 */
export function createModeloBase1LocalWriteDiagnostics(input = {}) {
  const o = isPlainObject(input) ? input : {};
  const last = isPlainObject(o.lastOperation) ? o.lastOperation : null;
  return safeClone({
    kind: 'modelobase1-local-write-diagnostics',
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    localWritePlanEnabled: Boolean(o.enabled),
    localWriteReady: Boolean(o.ready),
    allowedOperations: [...LOCAL_WRITE_ALLOWED_OPERATIONS],
    blockedOperations: [...LOCAL_WRITE_BLOCKED_OPERATIONS],
    lastOperation: last
      ? { operation: last.operation ?? null, ok: Boolean(last.ok), applied: Boolean(last.applied) }
      : null,
    localOnly: true,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistence: 'none',
    fallbackAvailable: true,
    rollbackAvailable: true,
    warnings: Array.isArray(o.warnings) ? o.warnings.map(String) : [],
    blockers: Array.isArray(o.blockers) ? o.blockers.map(String) : [],
    noSideEffects: true,
    nextAllowedStep: 'ModeloBase1 Controlled Local Write Activation',
  });
}

export default createModeloBase1LocalWriteDiagnostics;

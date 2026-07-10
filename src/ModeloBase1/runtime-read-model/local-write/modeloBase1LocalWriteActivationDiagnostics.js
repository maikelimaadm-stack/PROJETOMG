import { isPlainObject, safeClone } from '../safety.js';

/**
 * Passive diagnostics for the ModeloBase1 controlled local write ACTIVATION.
 * Pure, deterministic; never exposes raw rows or sensitive data — only flags,
 * counts, and the last operation's metadata.
 *
 * @param {Object} [input]
 * @param {string} [input.moduleId]
 * @param {Object} [input.activation] Result of resolveModeloBase1LocalWriteActivation.
 * @param {number} [input.operationCount]
 * @param {number} [input.localRowCount]
 * @param {boolean} [input.hasLocalChanges]
 * @param {Object|null} [input.lastOperation]
 * @returns {Object}
 */
export function createModeloBase1LocalWriteActivationDiagnostics(input = {}) {
  const o = isPlainObject(input) ? input : {};
  const activation = isPlainObject(o.activation) ? o.activation : {};
  const last = isPlainObject(o.lastOperation) ? o.lastOperation : null;
  return safeClone({
    kind: 'modelobase1-local-write-activation-diagnostics',
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : (typeof activation.moduleId === 'string' ? activation.moduleId : null),
    activationApplied: activation.activationApplied === true,
    activationRequested: activation.activationRequested === true,
    planEnabled: activation.planEnabled === true,
    betaApplied: activation.betaApplied === true,
    readOnlyFallback: activation.readOnlyFallback !== false,
    fallbackReason: typeof activation.reason === 'string' ? activation.reason : null,
    localOnly: true,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistence: 'none',
    operationCount: Number.isFinite(o.operationCount) ? Number(o.operationCount) : 0,
    localRowCount: Number.isFinite(o.localRowCount) ? Number(o.localRowCount) : 0,
    hasLocalChanges: Boolean(o.hasLocalChanges),
    lastOperation: last
      ? { operation: last.operation ?? null, ok: Boolean(last.ok), applied: Boolean(last.applied), simulatedSubmit: Boolean(last.simulatedSubmit), sent: last.sent === true }
      : null,
    fallbackAvailable: true,
    rollbackAvailable: true,
    noSideEffects: true,
    nextAllowedStep: 'ModeloBase1 Local Persistence Validation',
  });
}

export default createModeloBase1LocalWriteActivationDiagnostics;

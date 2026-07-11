import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelWriteContract,
  validateGenericModelWritePayload,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_ALLOWED_OPERATIONS,
  MODELOBASE2_BLOCKED_OPERATIONS,
} from './modeloBase2PrototypeConfig.js';

/** Operational operation → generic local write operation. */
const OPERATION_MAP = {
  createOperationalDraft: 'create',
  updateOperationalDraft: 'update',
  validateOperationalDraft: 'validatePayload',
  appendLocalEvent: 'create',
  amendLocalEvent: 'update',
  discardLocalEvent: 'delete',
  saveOperationalDraft: 'saveDraft',
  submitOperationalDraft: 'submitDraft',
  resetOperationalDraft: 'resetDraft',
  simulateOperationalCommit: 'simulateMutation',
};

/**
 * Builds the ModeloBase2 OPERATIONAL WRITE CONTRACT on top of the generic write
 * contract. Local-only: it maps operational operations to generic local write
 * operations and validates payloads with the generic kernel (fail-closed). It
 * never enables a backend/Prisma write. Pure.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} write contract with validateOperation()
 */
export function createModeloBase2OperationalWriteContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-prototype';

  const generic = createGenericModelWriteContract({ modelId: MODELOBASE2_MODEL_ID, moduleId, enabled: true, persistenceMode: 'local_validation' });

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-operational-write-contract',
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    genericContract: generic,
    operationalOperations: [...MODELOBASE2_ALLOWED_OPERATIONS],
    blockedOperations: [...MODELOBASE2_BLOCKED_OPERATIONS],
    operationMap: { ...OPERATION_MAP },
    payloadValidation: 'fail-closed',
    localOnly: true,
    backendAllowed: false,
    persistenceReal: false,
  });

  return {
    ...descriptor,
    /**
     * Validates an operational operation + payload (fail-closed). Unknown/blocked
     * operations, unsafe payloads and forbidden targets all reject.
     * @param {string} operation
     * @param {unknown} [payload]
     * @returns {{ ok: boolean, operation: string, genericOperation: string|null, localOnly: boolean, backendTouched: boolean, prismaTouched: boolean, runtimeBridgeTouched: boolean, errors: string[], blockers: string[] }}
     */
    validateOperation(operation, payload) {
      const genericOperation = Object.prototype.hasOwnProperty.call(OPERATION_MAP, operation) ? OPERATION_MAP[operation] : null;
      if (!genericOperation) {
        return { ok: false, operation, genericOperation: null, localOnly: true, backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false, errors: [`operation "${String(operation)}" is not an allowed operational operation`], blockers: [] };
      }
      const validation = validateGenericModelWritePayload({ modelId: MODELOBASE2_MODEL_ID, moduleId, operation: genericOperation, payload });
      return {
        ok: validation.valid,
        operation,
        genericOperation,
        localOnly: true,
        backendTouched: false,
        prismaTouched: false,
        runtimeBridgeTouched: false,
        errors: validation.errors,
        blockers: validation.blockers,
      };
    },
  };
}

export default createModeloBase2OperationalWriteContract;

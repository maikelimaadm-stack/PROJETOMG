import {
  isGenericModelPlainObject,
  createGenericModelWriteContract,
  validateGenericModelWritePayload,
} from '../../runtime/generic-model/index.js';
import { MODELOBASE1_MODEL_ID } from './mapModeloBase1RuntimeReadToGenericModel.js';
import { adapterError } from './errors.js';

/** Maps ModeloBase1 local write verbs to the generic write operations. */
export const MODELOBASE1_TO_GENERIC_WRITE_OP = Object.freeze({
  createRow: 'create',
  updateRow: 'update',
  deleteRow: 'delete',
  saveDraft: 'saveDraft',
  submitDraft: 'submitDraft',
  resetDraft: 'resetDraft',
});

/**
 * A WRITE BRIDGE that validates ModeloBase1 local write operations using the
 * generic write contract + payload validation. It maps ModeloBase1 verbs
 * (createRow/updateRow/…) to generic operations and keeps everything localOnly.
 * Pure and fail-closed; it does NOT execute writes and does NOT replace the
 * existing ModeloBase1 controller — it proves safe integration.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} write bridge
 */
export function createModeloBase1GenericWriteBridge(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const contract = createGenericModelWriteContract({ modelId: MODELOBASE1_MODEL_ID, moduleId, enabled: true, persistenceMode: 'local_validation' });

  /**
   * Validates a ModeloBase1 write op through the generic kernel.
   * @param {string} mb1Operation createRow|updateRow|deleteRow|saveDraft|submitDraft|resetDraft
   * @param {unknown} [payload]
   * @returns {{ ok: boolean, genericOperation: string|null, validation: Object, localOnly: true, backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false }}
   */
  function validateOperation(mb1Operation, payload) {
    const genericOperation = MODELOBASE1_TO_GENERIC_WRITE_OP[mb1Operation] ?? null;
    if (!genericOperation) {
      return {
        ok: false,
        genericOperation: null,
        validation: { valid: false, blockers: [`unknown ModeloBase1 write op "${String(mb1Operation)}"`] },
        localOnly: true,
        backendTouched: false,
        prismaTouched: false,
        runtimeBridgeTouched: false,
      };
    }
    const validation = validateGenericModelWritePayload({ moduleId, operation: genericOperation, payload });
    return {
      ok: validation.safeToApply,
      genericOperation,
      validation,
      localOnly: true,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
    };
  }

  return {
    kind: 'modelobase1-generic-write-bridge',
    moduleId,
    contract,
    mapping: { ...MODELOBASE1_TO_GENERIC_WRITE_OP },
    validateOperation,
    /** @param {string} mb1Operation */
    mapOperation(mb1Operation) {
      const op = MODELOBASE1_TO_GENERIC_WRITE_OP[mb1Operation] ?? null;
      if (!op) throw adapterError('MAK-MB1-GA-004', `unknown ModeloBase1 write op "${String(mb1Operation)}"`);
      return op;
    },
  };
}

export default createModeloBase1GenericWriteBridge;

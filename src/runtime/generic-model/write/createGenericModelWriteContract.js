import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import {
  GENERIC_MODEL_ALLOWED_WRITE_OPERATIONS,
  GENERIC_MODEL_BLOCKED_WRITE_OPERATIONS,
  GENERIC_MODEL_STORAGE_MODES,
} from '../contracts/genericModelContractConstants.js';

/**
 * Builds the Generic Model WRITE CONTRACT. Declarative, pure, passive. Allows
 * only local/simulated operations; blocks backend/Prisma/fetch/auto-storage/
 * side-effects/runtimeBridge by default. Returns a safe copy.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.enabled]
 * @param {'none'|'local_validation'|'local'} [options.persistenceMode]
 * @param {boolean} [options.backendAllowed] Opt-in only; default false.
 * @returns {Object}
 */
export function createGenericModelWriteContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const persistenceMode = ['none', 'local_validation', 'local'].includes(o.persistenceMode) ? o.persistenceMode : 'none';

  return safeCloneGenericModel({
    kind: 'generic-model-write-contract',
    contractId: `gm-write-${typeof o.modelId === 'string' ? o.modelId : 'generic'}-${typeof o.moduleId === 'string' ? o.moduleId : 'unknown'}`,
    modelId: typeof o.modelId === 'string' ? o.modelId : null,
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    enabled: Boolean(o.enabled),
    allowedOperations: [...GENERIC_MODEL_ALLOWED_WRITE_OPERATIONS],
    blockedOperations: [...GENERIC_MODEL_BLOCKED_WRITE_OPERATIONS],
    payloadValidation: 'fail-closed',
    localOnly: true,
    backendAllowed: o.backendAllowed === true, // opt-in only; default false
    persistenceMode,
    storageModes: [...GENERIC_MODEL_STORAGE_MODES],
    diagnostics: {
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      persistenceReal: false,
    },
  });
}

export default createGenericModelWriteContract;

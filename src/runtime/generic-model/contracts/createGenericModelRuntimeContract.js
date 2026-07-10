import { isGenericModelPlainObject, safeCloneGenericModel } from '../safety/assertGenericModelPlainObject.js';
import { createGenericModelReadContract } from '../read/createGenericModelReadContract.js';
import { createGenericModelWriteContract } from '../write/createGenericModelWriteContract.js';
import { createGenericModelSafetyPolicy } from '../safety/createGenericModelSafetyPolicy.js';
import {
  GENERIC_MODEL_TYPES,
  GENERIC_MODEL_CAPABILITIES,
  GENERIC_MODEL_DANGEROUS_CAPABILITIES,
  GENERIC_MODEL_STORAGE_MODES,
  GENERIC_MODEL_NEXT_STEP,
} from './genericModelContractConstants.js';

/**
 * Consolidates the Generic Model RUNTIME CONTRACT — read + write + persistence
 * shape + safety policy + capabilities. Dangerous capabilities (backendWrite/
 * workflow/connector/marketplacePublish) are FALSE by default; safe capabilities
 * (read/localWrite/localPersistenceValidation) default on. Pure, passive, safe
 * copy. This is the FOUNDATION contract — ModeloBase1 is NOT replaced; a future
 * adapter will consume this.
 *
 * @param {Object} [options]
 * @param {string} [options.modelId]
 * @param {string} [options.moduleId]
 * @param {string} [options.modelType]
 * @param {Object} [options.capabilityGates] Explicit opt-in gates.
 * @param {'none'|'local_validation'|'local'} [options.persistenceMode]
 * @returns {Object}
 */
export function createGenericModelRuntimeContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const modelId = typeof o.modelId === 'string' ? o.modelId : 'generic-model';
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const modelType = GENERIC_MODEL_TYPES.includes(o.modelType) ? o.modelType : 'custom';
  const gates = isGenericModelPlainObject(o.capabilityGates) ? o.capabilityGates : {};

  const safetyPolicy = createGenericModelSafetyPolicy({ modelId, moduleId, capabilityGates: gates });

  return safeCloneGenericModel({
    kind: 'generic-model-runtime-contract',
    contractId: `gm-runtime-${modelId}-${moduleId}`,
    modelId,
    moduleId,
    modelType,
    capabilities: safetyPolicy.capabilities,
    dangerousCapabilities: [...GENERIC_MODEL_DANGEROUS_CAPABILITIES],
    knownCapabilities: [...GENERIC_MODEL_CAPABILITIES],
    readContract: createGenericModelReadContract({ modelId, moduleId, modelType, enabled: true }),
    writeContract: createGenericModelWriteContract({ modelId, moduleId, enabled: true, persistenceMode: o.persistenceMode }),
    persistenceContract: {
      storageModes: [...GENERIC_MODEL_STORAGE_MODES],
      persistenceReal: false,
      localOnly: true,
    },
    safetyPolicy,
    fallbackPolicy: { available: true },
    diagnosticsPolicy: { noSideEffects: true },
    adapters: { registered: [], note: 'model-specific adapters attach here (ModeloBase1, modeloBase2, ...)' },
    versioning: { supported: true, deterministic: true },
    futureCompatibility: {
      studioEditable: safetyPolicy.capabilities.studioEditable === true,
      marketplacePublish: safetyPolicy.capabilities.marketplacePublish === true,
      modelTypes: [...GENERIC_MODEL_TYPES],
    },
    localOnly: true,
    persistenceReal: false,
    nextAllowedStep: GENERIC_MODEL_NEXT_STEP,
  });
}

export default createGenericModelRuntimeContract;

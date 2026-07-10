import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelRuntimeContract,
  GENERIC_MODEL_SCHEMA_VERSION,
} from '../../runtime/generic-model/index.js';
import {
  mapModeloBase1RuntimeReadToGenericModel,
  MODELOBASE1_MODEL_ID,
  MODELOBASE1_MODEL_TYPE,
} from './mapModeloBase1RuntimeReadToGenericModel.js';
import { mapGenericModelReadToModeloBase1State } from './mapGenericModelReadToModeloBase1State.js';
import { createModeloBase1GenericSafetyBridge } from './createModeloBase1GenericSafetyBridge.js';
import { createModeloBase1GenericDiagnosticsBridge } from './createModeloBase1GenericDiagnosticsBridge.js';
import { createModeloBase1GenericFallbackBridge } from './createModeloBase1GenericFallbackBridge.js';
import { createModeloBase1GenericWriteBridge } from './createModeloBase1GenericWriteBridge.js';
import { createModeloBase1GenericPersistenceBridge } from './createModeloBase1GenericPersistenceBridge.js';
import { adapterError } from './errors.js';

/**
 * The thin ModeloBase1 → GENERIC MODEL KERNEL ADAPTER. It wires ModeloBase1 to
 * the pure generic-model kernel (read/write/persistence/safety/fallback/
 * diagnostics) WITHOUT replacing the current ModeloBase1 flow. Additive,
 * reversible, React-free, backend-free. Dangerous capabilities stay false.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} adapter
 */
export function createModeloBase1GenericModelAdapter(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw adapterError('MAK-MB1-GA-001', 'createModeloBase1GenericModelAdapter() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : 'unknown';

  const runtimeContract = createGenericModelRuntimeContract({
    modelId: MODELOBASE1_MODEL_ID,
    moduleId,
    modelType: MODELOBASE1_MODEL_TYPE,
    persistenceMode: 'local_validation',
  });

  const safetyBridge = createModeloBase1GenericSafetyBridge({ moduleId });
  const diagnosticsBridge = { create: (input) => createModeloBase1GenericDiagnosticsBridge({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }) };
  const fallbackBridge = { create: (input) => createModeloBase1GenericFallbackBridge({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }) };
  const writeBridge = createModeloBase1GenericWriteBridge({ moduleId });
  const persistenceBridge = createModeloBase1GenericPersistenceBridge({ moduleId });

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase1-generic-model-adapter',
    adapterId: `mb1-generic-adapter-${moduleId}`,
    modelType: MODELOBASE1_MODEL_TYPE,
    modelFamily: 'modeloBase1',
    modelId: MODELOBASE1_MODEL_ID,
    moduleId,
    supports: {
      read: true,
      localWrite: true,
      localPersistenceValidation: true,
      diagnostics: true,
      fallback: true,
    },
    capabilities: runtimeContract.capabilities, // dangerous ones stay false
    genericKernelVersion: GENERIC_MODEL_SCHEMA_VERSION,
    mappings: {
      readToGeneric: 'mapModeloBase1RuntimeReadToGenericModel',
      genericToRead: 'mapGenericModelReadToModeloBase1State',
      writeOps: writeBridge.mapping,
    },
    limitations: [
      'thin adapter — does NOT replace ModeloBase1 hooks/UI/engine',
      'UI still uses the current ModeloBase1 flow',
      'persistence is memory-only (persistenceReal:false)',
      'Empresas/cadcps unchanged',
    ],
    nextSteps: ['Empresas/cadcps consuming Generic Kernel through ModeloBase1'],
    localOnly: true,
    persistenceReal: false,
    noSideEffects: true,
  });

  // Re-attach live bridges/functions (dropped by the safe clone).
  return {
    ...descriptor,
    runtimeContract,
    safetyBridge,
    diagnosticsBridge,
    fallbackBridge,
    writeBridge,
    persistenceBridge,
    mapReadToGeneric: (input) => mapModeloBase1RuntimeReadToGenericModel({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    mapGenericToRead: (input) => mapGenericModelReadToModeloBase1State(isGenericModelPlainObject(input) ? input : {}),
  };
}

export default createModeloBase1GenericModelAdapter;

import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelRuntimeContract,
  createGenericModelTypeRegistry,
  createGenericModelCapabilityMatrix,
  validateGenericModelAdapterConformance,
  GENERIC_MODEL_SCHEMA_VERSION,
} from '../../runtime/generic-model/index.js';
import { createModeloBase2PrototypeAdapter } from '../prototype-adapter/createModeloBase2PrototypeAdapter.js';
import { createModeloBase2OperationalSession } from './createModeloBase2OperationalSession.js';
import { createModeloBase2OperationalRuntimeFallback } from './createModeloBase2OperationalRuntimeFallback.js';
import { resolveModeloBase2OperationalRuntimeConfig } from './modeloBase2OperationalRuntimeConfig.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_OPERATIONAL_RUNTIME_MODE,
} from './modeloBase2OperationalRuntimeConfig.js';
import { operationalRuntimeError } from './errors.js';

/**
 * The headless ModeloBase2 OPERATIONAL RUNTIME FOUNDATION. It evolves the prototype
 * adapter into a reusable operational runtime (session + state machine + command +
 * event log + derived read state + snapshot bridge) that runs a full local cycle
 * WITHOUT a backend. Composes the generic-model kernel (runtime contract + type
 * registry conformance + capability matrix). Dangerous capabilities stay false;
 * localOnly/sent/persistenceReal safe. Coexists with ModeloBase1. Reversible.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Record<string, unknown>} [options.env]
 * @returns {Object} runtime
 */
export function createModeloBase2OperationalRuntime(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw operationalRuntimeError('MAK-MB2-OR-001', 'createModeloBase2OperationalRuntime() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : 'operacional-runtime';
  const config = resolveModeloBase2OperationalRuntimeConfig({ moduleId, env: options.env });
  const runtimeId = `mb2-op-runtime-${moduleId}`;

  const adapter = createModeloBase2PrototypeAdapter({ moduleId });
  const genericRuntimeContract = createGenericModelRuntimeContract({ modelId: MODELOBASE2_MODEL_ID, moduleId, modelType: MODELOBASE2_MODEL_TYPE, persistenceMode: 'local_validation' });
  const registry = createGenericModelTypeRegistry();
  const capabilityMatrix = createGenericModelCapabilityMatrix();
  const conformance = validateGenericModelAdapterConformance({ adapter, modelTypeDefinition: registry.get('operacional'), capabilityMatrix, expectedModelType: 'operacional', expectedModelFamily: 'modeloBase2' });

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-operational-runtime',
    runtimeId,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    mode: MODELOBASE2_OPERATIONAL_RUNTIME_MODE,
    enabled: config.foundationEnabled,
    supports: {
      operationalSession: true,
      commandResolution: true,
      eventLog: true,
      readStateDerivation: true,
      localSnapshot: true,
      diagnostics: true,
      fallback: true,
    },
    capabilities: genericRuntimeContract.capabilities, // dangerous ones stay false
    genericKernelVersion: GENERIC_MODEL_SCHEMA_VERSION,
    typeRegistryConformance: { valid: conformance.valid, conformanceScore: conformance.conformanceScore, modelType: conformance.modelType },
    capabilityMatrixStatus: capabilityMatrix.dangerousAllFalse ? 'dangerous-all-false' : 'review',
    safety: { localOnly: true, sent: false, persistenceReal: false, noSideEffects: true, backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false },
    limitations: [
      'headless — NO real UI/route/menu/module',
      'local state machine, not a real workflow/automation',
      'event log is local + memory-only (persistenceReal:false); events never sent',
      'does NOT touch real modules (pesagem/combustível) or ModeloBase1',
    ],
    nextSteps: ['ModeloBase2 First Real Module Candidate Audit', 'Fuel/Pesagem Headless Candidate'],
    localOnly: true,
    persistenceReal: false,
    sent: false,
  });

  return {
    ...descriptor,
    genericRuntimeContract,
    conformance,
    createSession: (input) => createModeloBase2OperationalSession({ runtimeId, moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    createFallback: (input) => createModeloBase2OperationalRuntimeFallback({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
  };
}

export default createModeloBase2OperationalRuntime;

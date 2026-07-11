import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelRuntimeContract,
  GENERIC_MODEL_SCHEMA_VERSION,
} from '../../runtime/generic-model/index.js';
import { createModeloBase2OperationalReadModel } from './createModeloBase2OperationalReadModel.js';
import { createModeloBase2OperationalWriteContract } from './createModeloBase2OperationalWriteContract.js';
import { createModeloBase2OperationalEventContract } from './createModeloBase2OperationalEventContract.js';
import { createModeloBase2OperationalDraft } from './createModeloBase2OperationalDraft.js';
import { applyModeloBase2OperationalMutation } from './applyModeloBase2OperationalMutation.js';
import {
  createModeloBase2OperationalSnapshot,
  validateModeloBase2OperationalSnapshot,
  roundTripModeloBase2OperationalSnapshot,
} from './createModeloBase2OperationalSnapshot.js';
import { createModeloBase2OperationalDiagnostics } from './createModeloBase2OperationalDiagnostics.js';
import { createModeloBase2OperationalFallback } from './createModeloBase2OperationalFallback.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
} from './modeloBase2PrototypeConfig.js';
import { modeloBase2Error } from './errors.js';

/**
 * The headless ModeloBase2 OPERATIONAL PROTOTYPE ADAPTER. It proves the generic
 * model kernel serves a SECOND model family (operacional / lançamento / evento /
 * append) — distinct from ModeloBase1's cadastro — WITHOUT any real UI, route,
 * menu, backend, Prisma, fetch, runtimeBridge or real persistence. Dangerous
 * capabilities stay false. Reversible by non-consumption. Coexists with ModeloBase1.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} adapter
 */
export function createModeloBase2PrototypeAdapter(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw modeloBase2Error('MAK-MB2-P-001', 'createModeloBase2PrototypeAdapter() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : 'operacional-prototype';

  const runtimeContract = createGenericModelRuntimeContract({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    persistenceMode: 'local_validation',
  });

  const writeContract = createModeloBase2OperationalWriteContract({ moduleId });
  const eventContract = createModeloBase2OperationalEventContract({ moduleId });

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-prototype-adapter',
    adapterId: `mb2-operational-adapter-${moduleId}`,
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    supports: {
      read: true,
      localWrite: true,
      operationalDraft: true,
      eventAppend: true,
      localPersistenceValidation: true,
      diagnostics: true,
      fallback: true,
    },
    capabilities: runtimeContract.capabilities, // dangerous ones stay false
    genericKernelVersion: GENERIC_MODEL_SCHEMA_VERSION,
    persistenceContract: runtimeContract.persistenceContract,
    limitations: [
      'headless prototype — NO real UI/route/menu',
      'operational model is intentionally minimal (entries + local event timeline)',
      'persistence is memory-only (persistenceReal:false); events never sent',
      'does NOT touch real modules (Empresas/cadcps/pesagem/combustível) or ModeloBase1',
    ],
    nextSteps: ['Generic Model Multi-Type Hardening', 'ModeloBase2 Operational Runtime Foundation'],
    localOnly: true,
    persistenceReal: false,
    sent: false,
    noSideEffects: true,
  });

  // Re-attach live contracts/bridges/functions (dropped by the safe clone).
  return {
    ...descriptor,
    runtimeContract,
    readContract: runtimeContract.readContract,
    writeContract,
    eventContract,
    safetyPolicy: runtimeContract.safetyPolicy,
    createReadModel: (input) => createModeloBase2OperationalReadModel({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    createDraft: (input) => createModeloBase2OperationalDraft({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    applyMutation: (input) => applyModeloBase2OperationalMutation({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    createSnapshot: (input) => createModeloBase2OperationalSnapshot({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    validateSnapshot: (input) => validateModeloBase2OperationalSnapshot(isGenericModelPlainObject(input) ? input : {}),
    roundTrip: (input) => roundTripModeloBase2OperationalSnapshot({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    createDiagnostics: (input) => createModeloBase2OperationalDiagnostics({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
    createFallback: (input) => createModeloBase2OperationalFallback({ moduleId, ...(isGenericModelPlainObject(input) ? input : {}) }),
  };
}

export default createModeloBase2PrototypeAdapter;

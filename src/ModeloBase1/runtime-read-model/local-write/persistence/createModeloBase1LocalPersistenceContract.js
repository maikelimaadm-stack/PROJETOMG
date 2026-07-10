import { isPlainObject, safeClone } from '../../safety.js';

/** Validation-only operations this slice allows (all local, no persistence). */
export const LOCAL_PERSISTENCE_ALLOWED_OPERATIONS = [
  'serializeDraft',
  'validateSnapshot',
  'rehydrateDraft',
  'compareDraftVersion',
  'clearDraftSnapshot',
  'inspectPersistenceDiagnostics',
  'reportReadiness',
];

/** Operations that MUST be blocked — anything that would persist for real. */
export const LOCAL_PERSISTENCE_BLOCKED_OPERATIONS = [
  'backendPersist',
  'backendCreate',
  'backendUpdate',
  'backendDelete',
  'prismaPersist',
  'prismaCreate',
  'prismaUpdate',
  'prismaDelete',
  'fetchWrite',
  'directDatabaseWrite',
  'persistStorageAutomatically',
  'executeAction',
  'startWorkflow',
  'invokeConnector',
  'mutateRuntimeBridge',
  'mutateGlobalRuntime',
  'replaceProductionUi',
];

/** Storage modes allowed this slice — memory or an injected (test) adapter. */
export const LOCAL_PERSISTENCE_STORAGE_MODES = ['memory_validation', 'injected_adapter_validation'];

/**
 * Builds the LOCAL PERSISTENCE CONTRACT for a module. Declarative, pure, passive.
 * Describes what the local persistence validation may/may not do, the allowed
 * storage modes (never real storage), and whether the foundation is ready to be
 * extracted into a GENERIC model contract in a future slice. Returns a safe copy.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.enabled]
 * @param {string} [options.storageMode]
 * @returns {Object}
 */
export function createModeloBase1LocalPersistenceContract(options = {}) {
  const o = isPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'unknown';
  const enabled = Boolean(o.enabled);
  const storageMode = LOCAL_PERSISTENCE_STORAGE_MODES.includes(o.storageMode) ? o.storageMode : 'memory_validation';

  return safeClone({
    contractId: `modelobase1-local-persistence-${moduleId}`,
    mode: 'local_persistence_validation',
    moduleId,
    enabled,
    allowedOperations: [...LOCAL_PERSISTENCE_ALLOWED_OPERATIONS],
    blockedOperations: [...LOCAL_PERSISTENCE_BLOCKED_OPERATIONS],
    storageMode,
    storageModes: [...LOCAL_PERSISTENCE_STORAGE_MODES],
    requiredInputs: ['moduleId', 'localDraft|snapshot', 'operation'],
    producedOutputs: ['snapshot', 'validation', 'rehydratedDraft', 'diagnostics'],
    safety: {
      localOnly: true,
      persistenceReal: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      mandatoryStorage: false,
      noSideEffects: true,
    },
    fallback: { available: true, reason: 'flag off → controlled local write (no persistence validation)' },
    rollback: { available: true, method: 'flag off / clear snapshots / rehydrate original read model' },
    diagnostics: {
      localPersistenceEnabled: enabled,
      allowedOperationCount: LOCAL_PERSISTENCE_ALLOWED_OPERATIONS.length,
      blockedOperationCount: LOCAL_PERSISTENCE_BLOCKED_OPERATIONS.length,
    },
    // Whether the contract/adapter/serialization/validation could become the
    // base for ALL MAK models (documented in GENERIC-MODEL-READINESS.md).
    genericModelReady: {
      ready: true,
      generic: ['contract', 'adapter', 'serialization', 'validation', 'rehydration', 'versioning', 'diagnostics', 'localOnly-safety'],
      modeloBase1Bound: ['file paths', 'names', 'runtimeReadModel integration', 'hook/UI'],
      futureTargets: ['modeloBase2', 'modeloBase3', 'native modules', 'user modules', 'Studio', 'Marketplace'],
      recommendation: 'Generic Model Runtime Extraction Audit',
    },
    nextAllowedStep: 'Generic Model Runtime Extraction Audit',
  });
}

export default createModeloBase1LocalPersistenceContract;

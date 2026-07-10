import { isPlainObject, safeClone } from '../../safety.js';

/**
 * Passive diagnostics for the ModeloBase1 local persistence validation. Pure,
 * deterministic; never exposes raw rows or sensitive data — only flags/counts.
 *
 * @param {Object} [input]
 * @param {string} [input.moduleId]
 * @param {boolean} [input.enabled]
 * @param {string} [input.storageMode]
 * @param {number} [input.snapshotCount]
 * @param {string|null} [input.lastSnapshotId]
 * @param {string} [input.validationStatus]
 * @param {string} [input.rehydrateStatus]
 * @param {boolean} [input.genericModelReady]
 * @param {string[]} [input.warnings]
 * @param {string[]} [input.blockers]
 * @returns {Object}
 */
export function createModeloBase1LocalPersistenceDiagnostics(input = {}) {
  const o = isPlainObject(input) ? input : {};
  return safeClone({
    kind: 'modelobase1-local-persistence-diagnostics',
    moduleId: typeof o.moduleId === 'string' ? o.moduleId : null,
    enabled: Boolean(o.enabled),
    storageMode: typeof o.storageMode === 'string' ? o.storageMode : 'memory_validation',
    localOnly: true,
    persistenceReal: false,
    snapshotCount: Number.isFinite(o.snapshotCount) ? Number(o.snapshotCount) : 0,
    lastSnapshotId: typeof o.lastSnapshotId === 'string' ? o.lastSnapshotId : null,
    validationStatus: typeof o.validationStatus === 'string' ? o.validationStatus : 'idle',
    rehydrateStatus: typeof o.rehydrateStatus === 'string' ? o.rehydrateStatus : 'idle',
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    fallbackAvailable: true,
    rollbackAvailable: true,
    genericModelReady: o.genericModelReady === true,
    warnings: Array.isArray(o.warnings) ? o.warnings.map(String) : [],
    blockers: Array.isArray(o.blockers) ? o.blockers.map(String) : [],
    noSideEffects: true,
    nextAllowedStep: 'Generic Model Runtime Extraction Audit',
  });
}

export default createModeloBase1LocalPersistenceDiagnostics;

import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';

/**
 * Builds the PERSISTENCE BOUNDARY for the future fuel module. Pure; React-free.
 * Declares what is allowed NOW (in-memory only) vs blocked NOW (any real
 * persistence / backend / sync). No real persistence; never sends.
 *
 * @param {Object} [options]
 * @returns {Object} persistence boundary descriptor
 */
export function createModeloBase2FuelModulePersistenceBoundary(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'modelobase2-fuel';

  return safeCloneGenericModel({
    kind: 'modelobase2-fuel-module-persistence-boundary',
    moduleId,
    persistenceReal: false,
    storageMode: 'memory_validation',
    localOnly: true,
    sent: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    allowedNow: [
      'in-memory draft',
      'snapshot validation',
      'restore validation',
      'diagnostics',
    ],
    blockedNow: [
      'backend write',
      'Prisma write',
      'IndexedDB required',
      'localStorage required',
      'runtimeBridge mutation',
      'sync',
      'connector',
      'workflow',
    ],
    futureDecision: {
      pending: true,
      options: ['controlled backend persistence', 'opt-in local persistence', 'sync policy'],
      decidedNow: false,
    },
    localOnlyNote: 'Persistência real permanece uma decisão futura, fora deste slice.',
  });
}

export default createModeloBase2FuelModulePersistenceBoundary;

import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelDiagnostics,
  GENERIC_MODEL_DANGEROUS_CAPABILITIES,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_FAMILY,
  MODELOBASE2_MODEL_TYPE,
} from './modeloBase2PrototypeConfig.js';

/**
 * Builds a passive DIAGNOSTICS record for the ModeloBase2 operational prototype,
 * wrapping the generic-kernel diagnostics and asserting the local-only /
 * no-side-effect invariants. Pure; never mutates the input.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft] Operational draft (for counts/status).
 * @param {boolean} [options.operationalReady]
 * @param {string[]} [options.warnings]
 * @param {string[]} [options.blockers]
 * @returns {Object} diagnostics
 */
export function createModeloBase2OperationalDiagnostics(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-prototype';
  const draft = isGenericModelPlainObject(o.draft) ? o.draft : {};
  const entriesCount = Array.isArray(draft.entries) ? draft.entries.length : 0;
  const eventsCount = Array.isArray(draft.events) ? draft.events.length : 0;
  const operationalReady = o.operationalReady !== false;

  const generic = createGenericModelDiagnostics({
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    phase: 'modelobase2-operational-prototype',
    enabled: operationalReady,
    source: 'modeloBase2-prototype',
    warnings: Array.isArray(o.warnings) ? o.warnings : [],
    blockers: Array.isArray(o.blockers) ? o.blockers : [],
    readiness: operationalReady ? 'ready' : 'fallback',
  });

  return safeCloneGenericModel({
    ...generic,
    kind: 'modelobase2-operational-diagnostics',
    modelFamily: MODELOBASE2_MODEL_FAMILY,
    modelType: MODELOBASE2_MODEL_TYPE,
    operationalReady,
    entriesCount,
    eventsCount,
    status: typeof draft.status === 'string' ? draft.status : null,
    dangerousCapabilities: Object.fromEntries(GENERIC_MODEL_DANGEROUS_CAPABILITIES.map((c) => [c, false])),
    localOnly: true,
    sent: false,
    persistenceReal: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    noSideEffects: true,
  });
}

export default createModeloBase2OperationalDiagnostics;

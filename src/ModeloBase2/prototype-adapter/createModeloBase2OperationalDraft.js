import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  createGenericModelVersion,
} from '../../runtime/generic-model/index.js';
import { computeOperationalSummary } from './createModeloBase2OperationalReadModel.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from './modeloBase2PrototypeConfig.js';

/**
 * Builds a ModeloBase2 OPERATIONAL DRAFT — the local, append-oriented working set
 * for an operational launch/entry flow. Local-only, never sent, never persisted for
 * real. Pure; never mutates the input. Deterministic version (clock injectable).
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.operationType]
 * @param {Array} [options.entries]
 * @param {Array} [options.events]
 * @param {string} [options.status] One of the operational draft statuses.
 * @param {number} [options.draftVersion]
 * @param {() => string} [options.clock]
 * @returns {Object} operational draft
 */
export function createModeloBase2OperationalDraft(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-prototype';
  const operationType = typeof o.operationType === 'string' ? o.operationType : 'lancamento';
  const entries = Array.isArray(o.entries) ? o.entries : [];
  const events = Array.isArray(o.events) ? o.events : [];
  const status = typeof o.status === 'string' ? o.status : 'draft';
  const clock = typeof o.clock === 'function' ? o.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;

  const version = createGenericModelVersion({ modelId: MODELOBASE2_MODEL_ID, moduleId, draftVersion: o.draftVersion, clock });
  const summary = computeOperationalSummary(entries);

  return safeCloneGenericModel({
    kind: 'modelobase2-operational-draft',
    draftId: `mb2-draft-${moduleId}-${version.draftVersion}`,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    operationType,
    status,
    entries,
    events,
    summary,
    localOnly: true,
    persistenceReal: false,
    sent: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    diagnostics: { operationalReady: true, entriesCount: entries.length, eventsCount: events.length },
    version,
  });
}

export default createModeloBase2OperationalDraft;

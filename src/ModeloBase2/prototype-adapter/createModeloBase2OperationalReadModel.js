import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  validateGenericModelReadModel,
  createGenericModelFallback,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_SOURCE,
} from './modeloBase2PrototypeConfig.js';

/**
 * Computes the operational summary from a list of entries. Pure.
 * @param {Array} entries
 * @returns {{ totalEntries: number, pendingEntries: number, invalidEntries: number, lastEntryAt: string|null }}
 */
export function computeOperationalSummary(entries) {
  const list = Array.isArray(entries) ? entries : [];
  let pending = 0;
  let invalid = 0;
  let lastEntryAt = null;
  for (const e of list) {
    const status = isGenericModelPlainObject(e) && typeof e.status === 'string' ? e.status : 'pending';
    if (status === 'pending') pending += 1;
    if (status === 'invalid') invalid += 1;
    const ts = isGenericModelPlainObject(e) && typeof e.timestamp === 'string' ? e.timestamp : null;
    if (ts && (lastEntryAt === null || ts > lastEntryAt)) lastEntryAt = ts;
  }
  return { totalEntries: list.length, pendingEntries: pending, invalidEntries: invalid, lastEntryAt };
}

/**
 * Computes the operational timeline from a list of events. Pure.
 * @param {Array} events
 * @returns {{ events: Array, lastEventId: string|null, sequence: number }}
 */
export function computeOperationalTimeline(events) {
  const list = Array.isArray(events) ? events : [];
  const last = list.length > 0 ? list[list.length - 1] : null;
  const lastEventId = isGenericModelPlainObject(last) && typeof last.eventId === 'string' ? last.eventId : null;
  const sequence = list.reduce((max, e) => {
    const seq = isGenericModelPlainObject(e) && typeof e.sequence === 'number' ? e.sequence : 0;
    return seq > max ? seq : max;
  }, 0);
  return { events: list, lastEventId, sequence };
}

/**
 * Builds a ModeloBase2 OPERATIONAL READ MODEL: an operational surface centered on
 * entries + a local event timeline (the differential vs ModeloBase1's cadastro
 * table/form), while still exposing a `table`/`form` for GenericModelReadModel
 * compatibility. Pure; never mutates the input; never touches a backend/Prisma/
 * fetch. Validates with the generic kernel and carries a fallback when invalid.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {string} [options.operationType]
 * @param {string} [options.status]
 * @param {Array} [options.entries]
 * @param {Array} [options.events]
 * @param {Array} [options.columns] Optional table columns for compatibility.
 * @param {Array} [options.fields] Optional form fields for compatibility.
 * @returns {{ ok: boolean, readModel: Object, validation: Object, fallback: Object|null, errors: string[], warnings: string[] }}
 */
export function createModeloBase2OperationalReadModel(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-prototype';
  const operationType = typeof o.operationType === 'string' ? o.operationType : 'lancamento';
  const status = typeof o.status === 'string' ? o.status : 'draft';
  const entries = Array.isArray(o.entries) ? o.entries : [];
  const events = Array.isArray(o.events) ? o.events : [];
  const columns = Array.isArray(o.columns) ? o.columns : [{ id: 'entryId' }, { id: 'type' }, { id: 'status' }];
  const fields = Array.isArray(o.fields) ? o.fields : [{ id: 'operationType' }, { id: 'status' }];

  const summary = computeOperationalSummary(entries);
  const timeline = computeOperationalTimeline(events);

  const readModel = safeCloneGenericModel({
    kind: 'modelobase2-operational-read-model',
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    source: MODELOBASE2_SOURCE,
    operationType,
    status,
    entries,
    summary,
    timeline,
    // Table/form kept for GenericModelReadModel compatibility (rows mirror entries).
    table: { columns, rows: entries.map((e) => ({ id: isGenericModelPlainObject(e) ? e.entryId : null, cells: isGenericModelPlainObject(e) ? e.values : null })) },
    form: { fields },
    diagnostics: { operationalReady: true, entriesCount: entries.length, eventsCount: events.length },
    safety: { readOnly: true, usesRealData: false, noSideEffects: true },
    fallback: { available: true },
  });

  const validation = validateGenericModelReadModel({ readModel, modelId: MODELOBASE2_MODEL_ID, moduleId });
  const fallback = validation.valid
    ? null
    : createGenericModelFallback({ modelId: MODELOBASE2_MODEL_ID, moduleId, operation: 'operationalRead', reason: 'invalid-read-model', source: 'legacy' });

  return {
    ok: validation.valid,
    readModel,
    validation,
    fallback,
    errors: validation.errors ?? [],
    warnings: validation.warnings ?? [],
  };
}

export default createModeloBase2OperationalReadModel;

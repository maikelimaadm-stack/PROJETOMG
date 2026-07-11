import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createModeloBase2OperationalReadModel } from '../prototype-adapter/createModeloBase2OperationalReadModel.js';

/**
 * Derives an operational READ STATE from a draft + event log + status. It reuses
 * the ModeloBase2 prototype read model (entries + summary + timeline, with a
 * secondary table/form for GenericModelReadModel compatibility). Pure: never
 * mutates the draft/event log. entries/timeline stay central; table/form secondary.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft]
 * @param {Object|Array} [options.eventLog] The event log instance or an events array.
 * @param {string} [options.status]
 * @param {string} [options.operationType]
 * @returns {{ readState: Object, validation: Object }}
 */
export function createModeloBase2OperationalReadState(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const draft = isGenericModelPlainObject(o.draft) ? o.draft : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : (typeof draft.moduleId === 'string' ? draft.moduleId : 'operacional-runtime');
  const entries = Array.isArray(draft.entries) ? draft.entries : [];
  const events = Array.isArray(o.eventLog)
    ? o.eventLog
    : (o.eventLog && typeof o.eventLog.list === 'function' ? o.eventLog.list() : (Array.isArray(draft.events) ? draft.events : []));
  const status = typeof o.status === 'string' ? o.status : (typeof draft.status === 'string' ? draft.status : 'draft');
  const operationType = typeof o.operationType === 'string' ? o.operationType : (typeof draft.operationType === 'string' ? draft.operationType : 'lancamento');

  const built = createModeloBase2OperationalReadModel({ moduleId, entries, events, operationType, status });

  const readState = safeCloneGenericModel({
    ...built.readModel,
    kind: 'modelobase2-operational-read-state',
    status,
    derivedFrom: { draft: true, eventLog: true, stateMachine: true },
    diagnostics: { ...(isGenericModelPlainObject(built.readModel.diagnostics) ? built.readModel.diagnostics : {}), status, eventsCount: events.length, entriesCount: entries.length },
  });

  return { readState, validation: built.validation };
}

export default createModeloBase2OperationalReadState;

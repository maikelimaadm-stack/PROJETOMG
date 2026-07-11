import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  sanitizeGenericModelPayload,
  createGenericModelChecksum,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_RUNTIME_EVENT_TYPES,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from './modeloBase2OperationalRuntimeConfig.js';
import { operationalRuntimeError } from './errors.js';

/**
 * Builds an APPEND-ONLY local EVENT LOG for the operational runtime. Deterministic
 * (seed + injectable clock). Events are local, never sent, never backed by a
 * backend/Prisma/fetch/runtimeBridge. Returns safe copies; never mutates callers'
 * input. Physical delete only via clear().
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {number} [options.seed] Starting sequence (default 1).
 * @param {() => string} [options.clock]
 * @param {Array} [options.events] Seed events (safe-cloned).
 * @returns {Object} event log
 */
export function createModeloBase2OperationalEventLog(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-runtime';
  const clock = typeof o.clock === 'function' ? o.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  let counter = Number.isInteger(o.seed) && o.seed > 0 ? o.seed : 1;

  /** @type {Object[]} */
  const events = [];
  if (Array.isArray(o.events)) {
    for (const e of o.events) if (isGenericModelPlainObject(e)) { events.push(safeCloneGenericModel(e)); counter = Math.max(counter, (Number.isInteger(e.sequence) ? e.sequence : 0) + 1); }
  }

  function append(input) {
    const i = isGenericModelPlainObject(input) ? input : {};
    if (!MODELOBASE2_RUNTIME_EVENT_TYPES.includes(i.eventType)) {
      throw operationalRuntimeError('MAK-MB2-OR-006', `unknown operational runtime event type "${String(i.eventType)}"`);
    }
    const sanitized = sanitizeGenericModelPayload({ payload: i.payload ?? null, label: 'operational runtime event payload' });
    if (!sanitized.safe) {
      throw operationalRuntimeError('MAK-MB2-OR-006', 'operational runtime event payload is unsafe', { blockers: sanitized.blockers });
    }
    const sequence = Number.isInteger(i.sequence) && i.sequence > 0 ? i.sequence : counter;
    counter = sequence + 1;
    const createdAt = clock();
    const content = {
      modelId: MODELOBASE2_MODEL_ID,
      moduleId,
      eventType: i.eventType,
      operationType: typeof i.operationType === 'string' ? i.operationType : 'lancamento',
      sequence,
      payload: sanitized.sanitized ?? null,
      parentEventId: typeof i.parentEventId === 'string' ? i.parentEventId : null,
      createdAt,
    };
    const checksum = createGenericModelChecksum({ value: content });
    const event = safeCloneGenericModel({
      kind: 'modelobase2-operational-runtime-event',
      eventId: `mb2-or-evt-${moduleId}-${sequence}-${checksum}`,
      ...content,
      status: 'recorded',
      localOnly: true,
      sent: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      checksum,
    });
    events.push(event);
    return safeCloneGenericModel(event);
  }

  const list = () => events.map((e) => safeCloneGenericModel(e));
  const getLast = () => (events.length > 0 ? safeCloneGenericModel(events[events.length - 1]) : null);
  const getById = (eventId) => {
    const found = events.find((e) => e.eventId === eventId);
    return found ? safeCloneGenericModel(found) : null;
  };
  const clear = () => { events.length = 0; counter = 1; return { ok: true, cleared: true, count: 0 }; };
  const deriveSummary = () => {
    /** @type {Record<string, number>} */ const byType = {};
    for (const e of events) byType[e.eventType] = (byType[e.eventType] ?? 0) + 1;
    return {
      totalEvents: events.length,
      lastEventId: events.length > 0 ? events[events.length - 1].eventId : null,
      sequence: events.length > 0 ? events[events.length - 1].sequence : 0,
      byType,
      localOnly: true,
      sent: false,
    };
  };

  return {
    kind: 'modelobase2-operational-event-log',
    moduleId,
    modelId: MODELOBASE2_MODEL_ID,
    appendOnly: true,
    localOnly: true,
    sent: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    append,
    list,
    getLast,
    getById,
    clear,
    deriveSummary,
    nextSequence: () => counter,
    get size() {
      return events.length;
    },
  };
}

export default createModeloBase2OperationalEventLog;

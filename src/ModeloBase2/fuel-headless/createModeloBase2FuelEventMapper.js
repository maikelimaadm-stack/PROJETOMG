import { isGenericModelPlainObject, safeCloneGenericModel, createGenericModelChecksum } from '../../runtime/generic-model/index.js';
import { MODELOBASE2_MODEL_ID, FUEL_DOMAIN } from './modeloBase2FuelHeadlessConfig.js';

/** Operational event type → fuel event type. */
const EVENT_MAP = {
  'draft.created': 'fuel.draft.created',
  'draft.updated': 'fuel.draft.updated',
  'entry.added': 'fuel.entry.added',
  'entry.updated': 'fuel.entry.updated',
  'entry.removed': 'fuel.entry.removed',
  'draft.validated': 'fuel.draft.validated',
  'draft.saved': 'fuel.draft.saved',
  'draft.submitted.simulated': 'fuel.draft.submitted.simulated',
  'snapshot.created': 'fuel.snapshot.created',
  'snapshot.restored': 'fuel.snapshot.restored',
  'draft.reset': 'fuel.draft.reset',
  'command.blocked': 'fuel.command.blocked',
  'fallback.applied': 'fuel.fallback.applied',
};

/**
 * Maps ModeloBase2 OPERATIONAL events to FUEL events. Deterministic (checksum via
 * the generic kernel). Pure; never mutates input.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} event mapper
 */
export function createModeloBase2FuelEventMapper(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'combustivel';

  /** @param {string} operationalEventType @returns {string|null} */
  function map(operationalEventType) {
    return Object.prototype.hasOwnProperty.call(EVENT_MAP, operationalEventType) ? EVENT_MAP[operationalEventType] : null;
  }

  /**
   * Maps an operational event object into a fuel event.
   * @param {Object} operationalEvent
   * @param {Object} [context] { fuelEntryId }
   * @returns {Object|null}
   */
  function mapEvent(operationalEvent, context = {}) {
    if (!isGenericModelPlainObject(operationalEvent)) return null;
    const operationalEventType = typeof operationalEvent.eventType === 'string' ? operationalEvent.eventType : null;
    const fuelEventType = operationalEventType ? map(operationalEventType) : null;
    if (!fuelEventType) return null;
    const ctx = isGenericModelPlainObject(context) ? context : {};
    const sequence = Number.isInteger(operationalEvent.sequence) ? operationalEvent.sequence : 0;
    const content = {
      modelId: MODELOBASE2_MODEL_ID,
      moduleId,
      domain: FUEL_DOMAIN,
      eventType: fuelEventType,
      operationalEventType,
      sequence,
      fuelEntryId: typeof ctx.fuelEntryId === 'string' ? ctx.fuelEntryId : (isGenericModelPlainObject(operationalEvent.payload) && typeof operationalEvent.payload.entryId === 'string' ? operationalEvent.payload.entryId : null),
      payload: isGenericModelPlainObject(operationalEvent.payload) ? operationalEvent.payload : null,
      createdAt: typeof operationalEvent.createdAt === 'string' ? operationalEvent.createdAt : null,
    };
    const checksum = createGenericModelChecksum({ value: content });
    return safeCloneGenericModel({
      kind: 'modelobase2-fuel-event',
      fuelEventId: `fuel-evt-${moduleId}-${sequence}-${checksum}`,
      ...content,
      localOnly: true,
      sent: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      checksum,
      diagnostics: { localOnly: true, sent: false },
    });
  }

  return {
    kind: 'modelobase2-fuel-event-mapper',
    moduleId,
    domain: FUEL_DOMAIN,
    eventMap: { ...EVENT_MAP },
    map,
    mapEvent,
  };
}

export default createModeloBase2FuelEventMapper;

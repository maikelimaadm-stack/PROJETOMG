import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
  sanitizeGenericModelPayload,
  createGenericModelChecksum,
} from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_EVENT_TYPES,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from './modeloBase2PrototypeConfig.js';
import { modeloBase2Error } from './errors.js';

/**
 * Builds the ModeloBase2 OPERATIONAL EVENT / APPEND CONTRACT. It creates LOCAL,
 * deterministic events (append-only) for the operational draft — never sent, never
 * backed by a backend/Prisma/fetch/runtimeBridge. Sequence is a locally increasing
 * counter (seed injectable); the clock is injectable; the checksum is deterministic
 * (FNV-1a). Pure aside from the local sequence counter it owns.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {number} [options.seed] Starting sequence (default 1).
 * @param {() => string} [options.clock] Deterministic clock; default fixed.
 * @returns {Object} event contract with createEvent()
 */
export function createModeloBase2OperationalEventContract(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-prototype';
  const clock = typeof o.clock === 'function' ? o.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  let counter = Number.isInteger(o.seed) && o.seed > 0 ? o.seed : 1;

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-operational-event-contract',
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    eventTypes: [...MODELOBASE2_EVENT_TYPES],
    appendOnly: true,
    localOnly: true,
    sent: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
  });

  /**
   * Creates a single deterministic local event. Fail-closed on unknown event type
   * or unsafe payload.
   * @param {Object} input
   * @param {string} input.eventType
   * @param {string} [input.operationType]
   * @param {unknown} [input.payload]
   * @param {number} [input.sequence] Explicit sequence (else next local counter).
   * @param {string|null} [input.parentEventId]
   * @param {string} [input.actor]
   * @returns {Object} event
   */
  function createEvent(input) {
    const i = isGenericModelPlainObject(input) ? input : {};
    if (!MODELOBASE2_EVENT_TYPES.includes(i.eventType)) {
      throw modeloBase2Error('MAK-MB2-P-004', `unknown operational event type "${String(i.eventType)}"`);
    }
    const sanitized = sanitizeGenericModelPayload({ payload: i.payload ?? null, label: 'operational event payload' });
    if (!sanitized.safe) {
      throw modeloBase2Error('MAK-MB2-P-004', 'operational event payload is unsafe', { blockers: sanitized.blockers, unsafeMarkers: sanitized.unsafeMarkers });
    }

    const sequence = Number.isInteger(i.sequence) && i.sequence > 0 ? i.sequence : counter;
    counter = sequence + 1;
    const createdAt = clock();
    const parentEventId = typeof i.parentEventId === 'string' ? i.parentEventId : null;
    const operationType = typeof i.operationType === 'string' ? i.operationType : 'lancamento';

    const content = {
      modelId: MODELOBASE2_MODEL_ID,
      moduleId,
      eventType: i.eventType,
      operationType,
      sequence,
      payload: sanitized.sanitized ?? null,
      parentEventId,
      createdAt,
    };
    const checksum = createGenericModelChecksum({ value: content });

    return safeCloneGenericModel({
      kind: 'modelobase2-operational-event',
      eventId: `mb2-evt-${moduleId}-${sequence}-${checksum}`,
      sequence,
      moduleId,
      modelId: MODELOBASE2_MODEL_ID,
      eventType: i.eventType,
      operationType,
      payload: sanitized.sanitized ?? null,
      status: 'recorded',
      localOnly: true,
      sent: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      createdAt,
      actor: typeof i.actor === 'string' ? i.actor : 'local',
      parentEventId,
      checksum,
      diagnostics: { localOnly: true, sent: false, masked: sanitized.maskedKeys.length > 0 },
    });
  }

  return { ...descriptor, createEvent, nextSequence: () => counter };
}

export default createModeloBase2OperationalEventContract;

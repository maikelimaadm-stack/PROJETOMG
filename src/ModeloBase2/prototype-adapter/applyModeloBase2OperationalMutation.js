import {
  isGenericModelPlainObject,
  safeCloneGenericModel,
} from '../../runtime/generic-model/index.js';
import { createModeloBase2OperationalWriteContract } from './createModeloBase2OperationalWriteContract.js';
import { createModeloBase2OperationalEventContract } from './createModeloBase2OperationalEventContract.js';
import { createModeloBase2OperationalDraft } from './createModeloBase2OperationalDraft.js';
import { computeOperationalSummary } from './createModeloBase2OperationalReadModel.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from './modeloBase2PrototypeConfig.js';
import { modeloBase2Error } from './errors.js';

/** Mutation → { operational write op, event type }. */
const MUTATION_MAP = {
  createDraft: { op: 'createOperationalDraft', event: 'draft.created' },
  updateDraft: { op: 'updateOperationalDraft', event: 'draft.updated' },
  appendEntry: { op: 'appendLocalEvent', event: 'entry.added' },
  updateEntry: { op: 'amendLocalEvent', event: 'entry.updated' },
  removeEntry: { op: 'discardLocalEvent', event: 'entry.removed' },
  saveDraft: { op: 'saveOperationalDraft', event: 'draft.saved' },
  submitDraft: { op: 'submitOperationalDraft', event: 'draft.submitted.simulated' },
  resetDraft: { op: 'resetOperationalDraft', event: 'draft.reset' },
};
const PAYLOAD_REQUIRED = new Set(['createDraft', 'updateDraft', 'appendEntry', 'updateEntry']);

/**
 * Applies a single LOCAL operational mutation to a ModeloBase2 draft, appending a
 * deterministic local event. Fail-closed: unknown operation, missing/invalid
 * payload, unsafe payload or forbidden target all reject without mutating the
 * input. Never sent, never real-persisted, never touches a backend/Prisma/fetch/
 * runtimeBridge. Returns safe copies.
 *
 * @param {Object} [options]
 * @param {string} [options.operation]
 * @param {string} [options.moduleId]
 * @param {Object} [options.draft] Existing draft (required except for createDraft).
 * @param {unknown} [options.payload]
 * @param {() => string} [options.clock]
 * @param {Object} [options.writeContract] Injectable (defaults to the operational write contract).
 * @param {Object} [options.eventContract] Injectable (defaults to the operational event contract).
 * @returns {{ ok: boolean, operation: string, moduleId: string, modelId: string, draft: Object|null, event: Object|null, events: Array, summary: Object|null, localOnly: boolean, sent: boolean, backendTouched: boolean, prismaTouched: boolean, runtimeBridgeTouched: boolean, persistenceReal: boolean, diagnostics: Object, errors: string[], warnings: string[] }}
 */
export function applyModeloBase2OperationalMutation(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw modeloBase2Error('MAK-MB2-P-001', 'applyModeloBase2OperationalMutation() options must be a plain object');
  }
  const operation = options.operation;
  const moduleId = typeof options.moduleId === 'string'
    ? options.moduleId
    : (isGenericModelPlainObject(options.draft) && typeof options.draft.moduleId === 'string' ? options.draft.moduleId : 'operacional-prototype');
  const clock = typeof options.clock === 'function' ? options.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  const payload = options.payload;

  const fail = (errors, blockers = []) => finalize({
    ok: false, operation: String(operation), moduleId, draft: isGenericModelPlainObject(options.draft) ? safeCloneGenericModel(options.draft) : null,
    event: null, events: isGenericModelPlainObject(options.draft) && Array.isArray(options.draft.events) ? safeCloneGenericModel(options.draft.events) : [],
    summary: isGenericModelPlainObject(options.draft) && isGenericModelPlainObject(options.draft.summary) ? safeCloneGenericModel(options.draft.summary) : null,
    errors: [...errors, ...blockers],
  });

  const mapping = Object.prototype.hasOwnProperty.call(MUTATION_MAP, operation) ? MUTATION_MAP[operation] : null;
  if (!mapping) return fail([`operation "${String(operation)}" is not a known operational mutation`]);

  if (PAYLOAD_REQUIRED.has(operation) && !isGenericModelPlainObject(payload)) {
    return fail([`operation "${operation}" requires a plain-object payload`]);
  }

  const writeContract = isGenericModelPlainObject(options.writeContract) ? options.writeContract : createModeloBase2OperationalWriteContract({ moduleId });
  const validation = writeContract.validateOperation(mapping.op, isGenericModelPlainObject(payload) ? payload : undefined);
  if (!validation.ok) return fail(validation.errors ?? [], validation.blockers ?? []);

  // Existing draft (or a fresh one for createDraft). Never mutate the input.
  let base;
  if (operation === 'createDraft') {
    base = createModeloBase2OperationalDraft({ moduleId, operationType: isGenericModelPlainObject(payload) ? payload.operationType : undefined, clock });
  } else {
    if (!isGenericModelPlainObject(options.draft)) return fail([`operation "${operation}" requires an existing draft`]);
    base = safeCloneGenericModel(options.draft);
  }

  const entries = Array.isArray(base.entries) ? [...base.entries] : [];
  const priorEvents = Array.isArray(base.events) ? [...base.events] : [];
  const eventContract = isGenericModelPlainObject(options.eventContract) ? options.eventContract : createModeloBase2OperationalEventContract({ moduleId, seed: priorEvents.length + 1, clock });
  let status = typeof base.status === 'string' ? base.status : 'draft';
  let eventPayload = isGenericModelPlainObject(payload) ? payload : {};

  switch (operation) {
    case 'appendEntry': {
      const entry = {
        entryId: `mb2-entry-${moduleId}-${entries.length + 1}`,
        type: typeof payload.type === 'string' ? payload.type : 'lancamento',
        timestamp: clock(),
        actor: typeof payload.actor === 'string' ? payload.actor : 'local',
        values: isGenericModelPlainObject(payload.values) ? payload.values : payload,
        status: 'pending',
        localOnly: true,
        validation: { valid: true },
      };
      entries.push(entry);
      eventPayload = entry;
      break;
    }
    case 'updateEntry': {
      const id = payload.entryId;
      const idx = entries.findIndex((e) => isGenericModelPlainObject(e) && e.entryId === id);
      if (idx < 0) return fail([`entry "${String(id)}" not found`]);
      entries[idx] = { ...entries[idx], values: isGenericModelPlainObject(payload.values) ? payload.values : entries[idx].values, status: 'pending' };
      eventPayload = entries[idx];
      break;
    }
    case 'removeEntry': {
      const id = payload && payload.entryId;
      const idx = entries.findIndex((e) => isGenericModelPlainObject(e) && e.entryId === id);
      if (idx < 0) return fail([`entry "${String(id)}" not found`]);
      const [removed] = entries.splice(idx, 1);
      eventPayload = { entryId: removed.entryId };
      break;
    }
    case 'saveDraft': {
      const invalid = entries.some((e) => isGenericModelPlainObject(e) && e.status === 'invalid');
      status = invalid ? 'invalid' : 'valid';
      break;
    }
    case 'submitDraft': {
      status = 'submitted_simulated';
      break;
    }
    case 'resetDraft': {
      entries.length = 0;
      status = 'reset';
      break;
    }
    case 'updateDraft': {
      status = typeof payload.status === 'string' && ['draft', 'valid', 'invalid'].includes(payload.status) ? payload.status : 'draft';
      break;
    }
    case 'createDraft':
    default:
      break;
  }

  let event;
  try {
    event = eventContract.createEvent({ eventType: mapping.event, operationType: base.operationType, payload: eventPayload, sequence: priorEvents.length + 1 });
  } catch (err) {
    return fail([err && err.message ? String(err.message) : 'event creation failed']);
  }
  const events = [...priorEvents, event];
  const summary = computeOperationalSummary(entries);

  const draft = safeCloneGenericModel({
    ...base,
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
  });

  return finalize({ ok: true, operation, moduleId, draft, event, events, summary, errors: [] });
}

/** Wraps a result with the invariant envelope + diagnostics. */
function finalize(input) {
  const events = Array.isArray(input.events) ? input.events : [];
  return {
    ok: input.ok === true,
    operation: input.operation,
    moduleId: input.moduleId,
    modelId: MODELOBASE2_MODEL_ID,
    draft: input.draft ?? null,
    event: input.event ?? null,
    events: safeCloneGenericModel(events),
    summary: input.summary ?? null,
    localOnly: true,
    sent: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    diagnostics: {
      operation: input.operation,
      ok: input.ok === true,
      eventsCount: events.length,
      localOnly: true,
      sent: false,
      persistenceReal: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
    },
    errors: Array.isArray(input.errors) ? input.errors : [],
    warnings: Array.isArray(input.warnings) ? input.warnings : [],
  };
}

export default applyModeloBase2OperationalMutation;

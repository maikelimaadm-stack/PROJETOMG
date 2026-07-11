import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { applyModeloBase2OperationalMutation } from '../prototype-adapter/applyModeloBase2OperationalMutation.js';
import { resolveModeloBase2OperationalCommand } from './resolveModeloBase2OperationalCommand.js';
import { validateModeloBase2OperationalCommandPayload } from './validateModeloBase2OperationalCommandPayload.js';
import { createModeloBase2OperationalStateMachine } from './createModeloBase2OperationalStateMachine.js';
import { createModeloBase2OperationalEventLog } from './createModeloBase2OperationalEventLog.js';
import { createModeloBase2OperationalReadState } from './createModeloBase2OperationalReadState.js';
import { createModeloBase2OperationalSnapshotBridge } from './createModeloBase2OperationalSnapshotBridge.js';
import { createModeloBase2OperationalDraft } from '../prototype-adapter/createModeloBase2OperationalDraft.js';
import { MODELOBASE2_MODEL_ID, MODELOBASE2_DEFAULT_CREATED_AT } from './modeloBase2OperationalRuntimeConfig.js';
import { operationalRuntimeError } from './errors.js';

const MAPPED_MUTATIONS = new Set(['createDraft', 'updateDraft', 'appendEntry', 'updateEntry', 'removeEntry', 'saveDraft', 'submitDraft', 'resetDraft']);

/**
 * Applies a single operational COMMAND: resolve → validate payload → state machine
 * → local mutation (delegating entry/draft ops to the prototype) → append event →
 * derive read state → diagnostics. Fail-closed and side-effect-free (no backend/
 * Prisma/fetch/runtimeBridge; never sends; never real-persists). Returns safe copies.
 *
 * @param {Object} [options]
 * @param {string} [options.commandType]
 * @param {string} [options.moduleId]
 * @param {unknown} [options.payload]
 * @param {Object|null} [options.draft]
 * @param {Object} [options.eventLog] Operational event log (created if absent).
 * @param {string} [options.currentState] Default 'idle'.
 * @param {() => string} [options.clock]
 * @param {Object} [options.snapshotBridge] Injectable snapshot bridge.
 * @param {Object} [options.stateMachine] Injectable state machine.
 * @returns {Object} result envelope
 */
export function applyModeloBase2OperationalCommand(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw operationalRuntimeError('MAK-MB2-OR-001', 'applyModeloBase2OperationalCommand() options must be a plain object');
  }
  const commandType = options.commandType;
  const moduleId = typeof options.moduleId === 'string'
    ? options.moduleId
    : (isGenericModelPlainObject(options.draft) && typeof options.draft.moduleId === 'string' ? options.draft.moduleId : 'operacional-runtime');
  const clock = typeof options.clock === 'function' ? options.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  const currentState = typeof options.currentState === 'string' ? options.currentState : 'idle';
  const payload = options.payload;
  const eventLog = isGenericModelPlainObject(options.eventLog) && typeof options.eventLog.append === 'function'
    ? options.eventLog
    : createModeloBase2OperationalEventLog({ moduleId, clock });
  const stateMachine = isGenericModelPlainObject(options.stateMachine) && typeof options.stateMachine.transition === 'function'
    ? options.stateMachine
    : createModeloBase2OperationalStateMachine();
  const snapshotBridge = isGenericModelPlainObject(options.snapshotBridge)
    ? options.snapshotBridge
    : createModeloBase2OperationalSnapshotBridge({ moduleId, clock });

  const baseDraft = isGenericModelPlainObject(options.draft) ? safeCloneGenericModel(options.draft) : null;

  const blocked = (nextState, errors, warnings = []) => {
    let event = null;
    try { event = eventLog.append({ eventType: 'command.blocked', operationType: 'command', payload: { commandType: typeof commandType === 'string' ? commandType : null, reason: errors[0] ?? 'blocked' } }); } catch { event = null; }
    return finalize({ ok: false, commandType, moduleId, previousState: currentState, nextState, draft: baseDraft, event, eventLog, snapshot: null, errors, warnings, readStateSource: baseDraft });
  };

  // 1. Resolve.
  const resolved = resolveModeloBase2OperationalCommand({ commandType, moduleId, payload });
  if (!resolved.ok) return blocked('blocked', resolved.errors);

  // 2. Validate payload.
  const validation = validateModeloBase2OperationalCommandPayload({ commandType, payload, moduleId, modelId: MODELOBASE2_MODEL_ID });
  if (!validation.valid) return blocked('blocked', [...validation.errors, ...validation.blockers], validation.warnings);

  // 3. State machine (validateDraft needs the computed validity).
  let validationValid = true;
  if (commandType === 'validateDraft') {
    const entries = baseDraft && Array.isArray(baseDraft.entries) ? baseDraft.entries : [];
    const forceInvalid = isGenericModelPlainObject(payload) && payload.forceInvalid === true;
    validationValid = !forceInvalid && entries.length > 0 && !entries.some((e) => isGenericModelPlainObject(e) && e.status === 'invalid');
  }
  const transition = stateMachine.transition(currentState, resolved.command, { validationValid });
  if (!transition.allowed) return blocked(transition.nextState || 'blocked', transition.blockers.length ? transition.blockers : ['invalid state transition'], transition.warnings);

  // 4. Apply the change.
  let nextDraft = baseDraft;
  let snapshot = null;
  const warnings = [...transition.warnings];
  const errors = [];

  try {
    if (MAPPED_MUTATIONS.has(commandType)) {
      const mutation = applyModeloBase2OperationalMutation({ operation: commandType, moduleId, draft: baseDraft, payload: isGenericModelPlainObject(payload) ? payload : undefined, clock });
      if (!mutation.ok) return blocked('blocked', mutation.errors ?? ['mutation failed'], mutation.warnings ?? []);
      nextDraft = mutation.draft;
    } else if (commandType === 'validateDraft') {
      nextDraft = baseDraft ? safeCloneGenericModel({ ...baseDraft, status: validationValid ? 'valid' : 'invalid' }) : createModeloBase2OperationalDraft({ moduleId, status: validationValid ? 'valid' : 'invalid', clock });
      if (!validationValid) warnings.push('draft is invalid (no entries or an invalid entry)');
    } else if (commandType === 'createSnapshot') {
      snapshot = snapshotBridge.createSnapshotFromSession({ draft: baseDraft, eventLog });
      if (!snapshot || snapshot.kind !== 'generic-model-snapshot') return blocked('blocked', ['snapshot creation failed']);
    } else if (commandType === 'restoreSnapshot') {
      const restore = snapshotBridge.restoreSessionFromSnapshot(isGenericModelPlainObject(payload) ? payload.snapshot : null);
      if (!restore.ok) return blocked('blocked', restore.errors);
      nextDraft = createModeloBase2OperationalDraft({ moduleId, entries: restore.session.entries, events: restore.session.events, status: restore.session.draft && restore.session.draft.status ? restore.session.draft.status : 'draft', clock });
    } else if (commandType === 'inspectDiagnostics') {
      nextDraft = baseDraft;
    }
  } catch (err) {
    return blocked('blocked', [err && err.message ? String(err.message) : 'command apply failed']);
  }

  // 5. Append the canonical runtime event (except inspectDiagnostics).
  let event = null;
  if (resolved.command.eventType) {
    try {
      event = eventLog.append({ eventType: resolved.command.eventType, operationType: 'operacional', payload: eventPayloadFor(commandType, nextDraft, snapshot) });
    } catch (err) { return blocked('blocked', [err && err.message ? String(err.message) : 'event append failed']); }
  }

  // Keep the draft's event list aligned with the canonical operational log.
  if (isGenericModelPlainObject(nextDraft)) nextDraft = safeCloneGenericModel({ ...nextDraft, events: eventLog.list() });

  return finalize({ ok: true, commandType, moduleId, previousState: currentState, nextState: transition.nextState, draft: nextDraft, event, eventLog, snapshot, errors, warnings, readStateSource: nextDraft });
}

/** Builds a compact, safe event payload for a command. */
function eventPayloadFor(commandType, draft, snapshot) {
  if (commandType === 'createSnapshot' && isGenericModelPlainObject(snapshot)) return { snapshotId: snapshot.snapshotId, checksum: snapshot.checksum };
  if (commandType === 'appendEntry' || commandType === 'updateEntry') {
    const entries = isGenericModelPlainObject(draft) && Array.isArray(draft.entries) ? draft.entries : [];
    const last = entries[entries.length - 1];
    return isGenericModelPlainObject(last) ? { entryId: last.entryId } : {};
  }
  if (isGenericModelPlainObject(draft)) return { status: draft.status ?? null, entriesCount: Array.isArray(draft.entries) ? draft.entries.length : 0 };
  return {};
}

/** Wraps the result with the invariant envelope + derived read state + diagnostics. */
function finalize(input) {
  const draft = isGenericModelPlainObject(input.draft) ? input.draft : null;
  const { readState } = createModeloBase2OperationalReadState({ moduleId: input.moduleId, draft: input.readStateSource ?? draft, eventLog: input.eventLog, status: draft && typeof draft.status === 'string' ? draft.status : input.nextState });
  return {
    ok: input.ok === true,
    command: typeof input.commandType === 'string' ? input.commandType : null,
    previousState: input.previousState,
    nextState: input.nextState,
    event: input.event ?? null,
    eventLog: input.eventLog.list(),
    draft,
    readState,
    snapshot: input.snapshot ?? null,
    localOnly: true,
    sent: false,
    backendTouched: false,
    prismaTouched: false,
    runtimeBridgeTouched: false,
    persistenceReal: false,
    diagnostics: {
      command: typeof input.commandType === 'string' ? input.commandType : null,
      ok: input.ok === true,
      previousState: input.previousState,
      nextState: input.nextState,
      eventCount: input.eventLog.size,
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

export default applyModeloBase2OperationalCommand;

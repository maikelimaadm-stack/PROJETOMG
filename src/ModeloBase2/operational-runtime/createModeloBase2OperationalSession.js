import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { applyModeloBase2OperationalCommand } from './applyModeloBase2OperationalCommand.js';
import { createModeloBase2OperationalEventLog } from './createModeloBase2OperationalEventLog.js';
import { createModeloBase2OperationalStateMachine } from './createModeloBase2OperationalStateMachine.js';
import { createModeloBase2OperationalSnapshotBridge } from './createModeloBase2OperationalSnapshotBridge.js';
import { createModeloBase2OperationalReadState } from './createModeloBase2OperationalReadState.js';
import { createModeloBase2OperationalRuntimeDiagnostics } from './createModeloBase2OperationalRuntimeDiagnostics.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_MODEL_TYPE,
  MODELOBASE2_DEFAULT_CREATED_AT,
} from './modeloBase2OperationalRuntimeConfig.js';

/**
 * Creates a HEADLESS operational SESSION — a local, stateful controller over a
 * draft + event log + state machine + snapshot bridge. `dispatch(command)` drives
 * the operational cycle without any side effect (no backend/Prisma/fetch/
 * runtimeBridge; never sends; never real-persists). Returns safe copies; never
 * mutates the caller's command input. A blocked command is reported but does NOT
 * commit a broken state (the session stays usable).
 *
 * @param {Object} [options]
 * @param {string} [options.runtimeId]
 * @param {string} [options.moduleId]
 * @param {() => string} [options.clock]
 * @returns {Object} session
 */
export function createModeloBase2OperationalSession(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-runtime';
  const runtimeId = typeof o.runtimeId === 'string' ? o.runtimeId : `mb2-op-runtime-${moduleId}`;
  const clock = typeof o.clock === 'function' ? o.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  const sessionId = `mb2-op-session-${moduleId}`;

  const eventLog = createModeloBase2OperationalEventLog({ moduleId, clock });
  const stateMachine = createModeloBase2OperationalStateMachine();
  const snapshotBridge = createModeloBase2OperationalSnapshotBridge({ moduleId, clock });

  /** @type {Object|null} */
  let draft = null;
  let status = 'idle';

  function dispatch(command) {
    const c = typeof command === 'string' ? { commandType: command } : (isGenericModelPlainObject(command) ? command : {});
    const result = applyModeloBase2OperationalCommand({
      commandType: c.commandType,
      moduleId,
      payload: c.payload,
      draft,
      eventLog,
      currentState: status,
      clock,
      snapshotBridge,
      stateMachine,
    });
    // Commit only on success — a blocked command keeps the session usable.
    if (result.ok) {
      if (isGenericModelPlainObject(result.draft)) draft = safeCloneGenericModel(result.draft);
      status = result.nextState;
    }
    return safeCloneGenericModel(result);
  }

  function getReadState() {
    return createModeloBase2OperationalReadState({ moduleId, draft: draft ?? {}, eventLog, status }).readState;
  }

  function getDiagnostics() {
    return createModeloBase2OperationalRuntimeDiagnostics({ runtimeId, sessionId, moduleId, currentState: status, draft: draft ?? {}, eventLog });
  }

  function getState() {
    return safeCloneGenericModel({
      kind: 'modelobase2-operational-session-state',
      sessionId,
      runtimeId,
      modelId: MODELOBASE2_MODEL_ID,
      moduleId,
      modelType: MODELOBASE2_MODEL_TYPE,
      status,
      draft,
      eventLog: eventLog.list(),
      readState: getReadState(),
      diagnostics: getDiagnostics(),
      localOnly: true,
      sent: false,
      persistenceReal: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
    });
  }

  const createSnapshot = () => dispatch({ commandType: 'createSnapshot' }).snapshot;
  const restoreSnapshot = (snapshot) => dispatch({ commandType: 'restoreSnapshot', payload: { snapshot } });
  const reset = () => dispatch({ commandType: 'resetDraft' });

  return {
    kind: 'modelobase2-operational-session',
    sessionId,
    runtimeId,
    modelId: MODELOBASE2_MODEL_ID,
    moduleId,
    modelType: MODELOBASE2_MODEL_TYPE,
    localOnly: true,
    sent: false,
    persistenceReal: false,
    dispatch,
    getState,
    getReadState,
    getEventLog: () => eventLog.list(),
    getDiagnostics,
    createSnapshot,
    restoreSnapshot,
    reset,
    get status() {
      return status;
    },
  };
}

export default createModeloBase2OperationalSession;

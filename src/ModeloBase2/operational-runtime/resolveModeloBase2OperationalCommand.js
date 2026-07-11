import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import {
  MODELOBASE2_MODEL_ID,
  MODELOBASE2_COMMAND_TYPES,
} from './modeloBase2OperationalRuntimeConfig.js';

/** commandType → { operation (prototype mutation or null), expectedState, eventType }. */
const COMMAND_MAP = {
  createDraft: { operation: 'createDraft', expectedState: 'draft', eventType: 'draft.created' },
  updateDraft: { operation: 'updateDraft', expectedState: 'dirty', eventType: 'draft.updated' },
  appendEntry: { operation: 'appendEntry', expectedState: 'dirty', eventType: 'entry.added' },
  updateEntry: { operation: 'updateEntry', expectedState: 'dirty', eventType: 'entry.updated' },
  removeEntry: { operation: 'removeEntry', expectedState: 'dirty', eventType: 'entry.removed' },
  validateDraft: { operation: null, expectedState: 'valid', eventType: 'draft.validated' },
  saveDraft: { operation: 'saveDraft', expectedState: 'saved_local', eventType: 'draft.saved' },
  submitDraft: { operation: 'submitDraft', expectedState: 'submitted_simulated', eventType: 'draft.submitted.simulated' },
  resetDraft: { operation: 'resetDraft', expectedState: 'reset', eventType: 'draft.reset' },
  createSnapshot: { operation: null, expectedState: null, eventType: 'snapshot.created' },
  restoreSnapshot: { operation: null, expectedState: null, eventType: 'snapshot.restored' },
  inspectDiagnostics: { operation: null, expectedState: null, eventType: null },
};

/**
 * Resolves an operational command into a structured, local command descriptor.
 * Fail-closed: unknown command types are rejected. Pure; never mutates input.
 *
 * @param {Object} [options]
 * @param {string} [options.commandType]
 * @param {string} [options.moduleId]
 * @param {unknown} [options.payload]
 * @returns {{ ok: boolean, command: Object|null, errors: string[] }}
 */
export function resolveModeloBase2OperationalCommand(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const commandType = o.commandType;
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'operacional-runtime';

  if (typeof commandType !== 'string' || !MODELOBASE2_COMMAND_TYPES.includes(commandType) || !Object.prototype.hasOwnProperty.call(COMMAND_MAP, commandType)) {
    return { ok: false, command: null, errors: [`command "${String(commandType)}" is not a known operational command`] };
  }

  const map = COMMAND_MAP[commandType];
  const command = safeCloneGenericModel({
    kind: 'modelobase2-operational-command',
    commandId: `mb2-cmd-${moduleId}-${commandType}`,
    commandType,
    operation: map.operation,
    eventType: map.eventType,
    moduleId,
    modelId: MODELOBASE2_MODEL_ID,
    payload: isGenericModelPlainObject(o.payload) ? o.payload : (o.payload ?? null),
    localOnly: true,
    sent: false,
    persistenceReal: false,
    expectedState: map.expectedState,
    safety: { localOnly: true, noSideEffects: true, backendTouched: false, prismaTouched: false, runtimeBridgeTouched: false },
    diagnostics: { resolved: true },
  });

  return { ok: true, command, errors: [] };
}

/** @param {string} commandType @returns {Object|null} */
export function getModeloBase2CommandMapping(commandType) {
  return Object.prototype.hasOwnProperty.call(COMMAND_MAP, commandType) ? { ...COMMAND_MAP[commandType] } : null;
}

export default resolveModeloBase2OperationalCommand;

import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { createModeloBase2FuelHeadlessCandidate } from '../fuel-headless/createModeloBase2FuelHeadlessCandidate.js';
import { createModeloBase2FuelSandboxActions } from './createModeloBase2FuelSandboxActions.js';
import { createModeloBase2FuelUiViewModel } from './createModeloBase2FuelUiViewModel.js';
import { createModeloBase2FuelSandboxDiagnostics } from './createModeloBase2FuelSandboxDiagnostics.js';
import { MODELOBASE2_DEFAULT_CREATED_AT } from './modeloBase2FuelUiSandboxConfig.js';
import { fuelUiSandboxError } from './errors.js';

/**
 * Creates a DEV-ONLY sandbox SESSION over the fuel headless candidate. It drives
 * the fuel cycle via sandbox actions and exposes a derived view model + diagnostics.
 * Pure aside from the candidate's own local state. React-free. No backend/Prisma/
 * fetch/runtimeBridge/storage; never sends; never real-persists. Returns safe copies.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @param {boolean} [options.enabled]
 * @param {() => string} [options.clock]
 * @returns {Object} sandbox session
 */
export function createModeloBase2FuelSandboxSession(options = {}) {
  if (!isGenericModelPlainObject(options)) {
    throw fuelUiSandboxError('MAK-MB2-FUEL-UI-001', 'createModeloBase2FuelSandboxSession() options must be a plain object');
  }
  const moduleId = typeof options.moduleId === 'string' ? options.moduleId : 'combustivel';
  const clock = typeof options.clock === 'function' ? options.clock : () => MODELOBASE2_DEFAULT_CREATED_AT;
  const enabled = options.enabled === true;
  const sandboxId = `fuel-sandbox-${moduleId}`;

  const candidate = createModeloBase2FuelHeadlessCandidate({ moduleId, clock });
  const actions = createModeloBase2FuelSandboxActions({ moduleId });

  function getViewModel() {
    const readState = candidate.getReadState();
    return createModeloBase2FuelUiViewModel({ readState, draft: candidate.getState().draft, diagnostics: getDiagnostics(), timeline: readState.timeline ? readState.timeline.events : [] });
  }

  function getDiagnostics() {
    const readState = candidate.getReadState();
    return createModeloBase2FuelSandboxDiagnostics({ sandboxId, moduleId, enabled, readState, status: candidate.getState().status });
  }

  /**
   * Dispatches a sandbox action → fuel headless command. Fail-closed. Returns a
   * safe-copy result envelope with the derived view model + diagnostics.
   * @param {string} actionType
   * @param {unknown} [payload]
   */
  function dispatchAction(actionType, payload) {
    const resolved = actions.resolveAction(actionType, payload);
    if (!resolved.ok) {
      return safeCloneGenericModel({
        ok: false, action: String(actionType), command: null, localOnly: true, sent: false, persistenceReal: false,
        viewModel: getViewModel(), diagnostics: getDiagnostics(), errors: resolved.errors, warnings: [],
      });
    }
    const result = candidate.dispatch({ fuelCommandType: resolved.fuelCommandType, payload: resolved.payload });
    return safeCloneGenericModel({
      ok: result.ok,
      action: actionType,
      command: resolved.fuelCommandType,
      localOnly: true,
      sent: false,
      persistenceReal: false,
      backendTouched: false,
      prismaTouched: false,
      runtimeBridgeTouched: false,
      viewModel: getViewModel(),
      diagnostics: getDiagnostics(),
      snapshot: result.snapshot ?? null,
      errors: result.errors ?? [],
      warnings: result.warnings ?? [],
    });
  }

  return {
    kind: 'modelobase2-fuel-sandbox-session',
    sandboxId,
    moduleId,
    localOnly: true,
    sent: false,
    persistenceReal: false,
    candidate,
    actions,
    dispatchAction,
    createDraft: (payload) => dispatchAction('newDraft', payload ?? {}),
    appendEntry: (entry) => dispatchAction('addFuelEntry', { entry }),
    updateEntry: (entryId, entry) => dispatchAction('editFuelEntry', { entryId, entry }),
    removeEntry: (entryId) => dispatchAction('removeFuelEntry', { entryId }),
    validateDraft: () => dispatchAction('validate'),
    saveDraft: () => dispatchAction('saveLocal'),
    submitDraft: () => dispatchAction('submitSimulated'),
    createSnapshot: () => candidate.createSnapshot(),
    restoreSnapshot: (snapshot) => dispatchAction('restore', { snapshot }),
    resetDraft: () => dispatchAction('reset'),
    getViewModel,
    getDiagnostics,
  };
}

export default createModeloBase2FuelSandboxSession;

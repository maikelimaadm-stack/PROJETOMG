import { isGenericModelPlainObject, safeCloneGenericModel } from '../../runtime/generic-model/index.js';
import { FUEL_DOMAIN, FUEL_SANDBOX_ACTIONS } from './modeloBase2FuelUiSandboxConfig.js';

/** Sandbox action → fuel headless command. */
const ACTION_MAP = {
  newDraft: 'createFuelDraft',
  addFuelEntry: 'appendFuelEntry',
  editFuelEntry: 'updateFuelEntry',
  removeFuelEntry: 'removeFuelEntry',
  validate: 'validateFuelDraft',
  saveLocal: 'saveFuelDraft',
  submitSimulated: 'submitFuelDraft',
  snapshot: 'createFuelSnapshot',
  restore: 'restoreFuelSnapshot',
  reset: 'resetFuelDraft',
  inspectDiagnostics: 'inspectFuelDiagnostics',
};

/**
 * Builds the SANDBOX ACTIONS descriptor mapping UI actions to fuel headless
 * commands. Pure; React-free. No action may call a backend/fetch/Prisma/
 * runtimeBridge/storage or run a workflow/connector — actions only resolve to a
 * local fuel command. Fail-closed on unknown actions.
 *
 * @param {Object} [options]
 * @param {string} [options.moduleId]
 * @returns {Object} sandbox actions
 */
export function createModeloBase2FuelSandboxActions(options = {}) {
  const o = isGenericModelPlainObject(options) ? options : {};
  const moduleId = typeof o.moduleId === 'string' ? o.moduleId : 'combustivel';

  const descriptor = safeCloneGenericModel({
    kind: 'modelobase2-fuel-sandbox-actions',
    domain: FUEL_DOMAIN,
    moduleId,
    actions: [...FUEL_SANDBOX_ACTIONS],
    actionMap: { ...ACTION_MAP },
    localOnly: true,
    sent: false,
    persistenceReal: false,
    blockedSideEffects: ['backend', 'fetch', 'prisma', 'runtimeBridge', 'storage', 'workflow', 'connector'],
  });

  /** @param {string} actionType @returns {string|null} */
  const map = (actionType) => (Object.prototype.hasOwnProperty.call(ACTION_MAP, actionType) ? ACTION_MAP[actionType] : null);

  /**
   * Resolves a sandbox action into a fuel command descriptor. Fail-closed.
   * @param {string} actionType
   * @param {unknown} [payload]
   * @returns {{ ok: boolean, action: string, fuelCommandType: string|null, payload: unknown, localOnly: boolean, sent: boolean, persistenceReal: boolean, errors: string[] }}
   */
  function resolveAction(actionType, payload) {
    const fuelCommandType = map(actionType);
    if (!fuelCommandType || !FUEL_SANDBOX_ACTIONS.includes(actionType)) {
      return { ok: false, action: String(actionType), fuelCommandType: null, payload: null, localOnly: true, sent: false, persistenceReal: false, errors: [`sandbox action "${String(actionType)}" is not known`] };
    }
    return {
      ok: true,
      action: actionType,
      fuelCommandType,
      payload: isGenericModelPlainObject(payload) ? payload : (payload ?? null),
      localOnly: true,
      sent: false,
      persistenceReal: false,
      errors: [],
    };
  }

  return { ...descriptor, map, resolveAction, listActions: () => [...FUEL_SANDBOX_ACTIONS] };
}

export default createModeloBase2FuelSandboxActions;

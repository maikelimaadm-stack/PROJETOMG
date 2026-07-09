import { ActionError } from './errors.js';

const VALID_KINDS = new Set(['command', 'action']);

/**
 * Action Engine (M10) — dispatches UEC Commands to bound handlers.
 * Resolves action declarations from the CRB `action` registry (RT-C-10),
 * delegates permission checks to the M09 Permission Engine (RT-C-09).
 * @implements {import('../../types/action.js').IActionEngine}
 */
export class ActionEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
   */
  constructor(options = {}) {
    const { registry, permissionEngine } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new ActionError('MAK-L3-ACTION-001', 'ActionEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._permissionEngine = permissionEngine ?? null;
    /** @type {Map<string, import('../../types/action.js').ActionHandler>} */
    this._handlers = new Map();
  }

  /**
   * @param {string} actionId
   * @param {import('../../types/action.js').ActionHandler} handler
   */
  bind(actionId, handler) {
    if (!isNonEmptyString(actionId)) {
      throw new ActionError('MAK-L3-ACTION-002', 'bind() requires a non-empty actionId');
    }
    if (typeof handler !== 'function') {
      throw new ActionError('MAK-L3-ACTION-002', `Handler for action "${actionId}" must be a function`);
    }
    this._handlers.set(actionId, handler);
  }

  /** @param {string} actionId */
  has(actionId) {
    return this._handlers.has(actionId);
  }

  /**
   * @param {import('../../types/action.js').UecCommand} command
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} ctx
   * @returns {Promise<import('../../types/action.js').UecResult>}
   */
  async dispatch(command, ctx) {
    if (!command || typeof command !== 'object' || !isNonEmptyString(command.type)) {
      return errorResult('MAK-L3-ACTION-003', 'Invalid UEC command: missing or invalid "type"');
    }
    if (command.kind !== undefined && !VALID_KINDS.has(command.kind)) {
      return errorResult('MAK-L3-ACTION-003', `Invalid UEC command kind: ${command.kind}`);
    }
    if (!('payload' in command)) {
      return errorResult('MAK-L3-ACTION-003', 'Invalid UEC command: missing "payload"');
    }

    const actionId = command.type;

    if (!this._registry.has('action', actionId)) {
      return errorResult('MAK-L3-ACTION-004', `Unknown action: ${actionId}`);
    }

    const handler = this._handlers.get(actionId);
    if (!handler) {
      return errorResult('MAK-L3-ACTION-004', `No handler bound for action: ${actionId}`);
    }

    const actionDef = this._registry.resolve('action', actionId);
    const requiredPermission = extractRequiredPermission(actionDef);

    if (requiredPermission) {
      const allowed = await this._checkPermission(requiredPermission, ctx);
      if (!allowed) {
        return errorResult('MAK-L3-ACTION-005', `Action "${actionId}" denied by Permission Engine`);
      }
    }

    try {
      const data = await handler(command.payload, ctx, actionDef);
      return { success: true, data };
    } catch (err) {
      return errorResult('MAK-L3-ACTION-006', err instanceof Error ? err.message : 'Action handler failed');
    }
  }

  /**
   * @param {string} code Permission code, e.g. "empresa.save".
   * @param {unknown} ctx
   */
  async _checkPermission(code, ctx) {
    if (!this._permissionEngine) return false;
    const idx = code.lastIndexOf('.');
    const resource = idx === -1 ? code : code.slice(0, idx);
    const action = idx === -1 ? 'execute' : code.slice(idx + 1);
    try {
      return await this._permissionEngine.can(action, resource, ctx);
    } catch {
      return false;
    }
  }
}

/** @param {unknown} value */
function isNonEmptyString(value) {
  return typeof value === 'string' && value.length > 0;
}

/**
 * Reads the permission code an action declares, if any.
 * Recognizes `actionDef.permission` or `actionDef.payload.permission`.
 * @param {{permission?: string, payload?: {permission?: string}}} actionDef
 */
function extractRequiredPermission(actionDef) {
  if (!actionDef) return undefined;
  if (typeof actionDef.permission === 'string' && actionDef.permission) return actionDef.permission;
  if (typeof actionDef.payload?.permission === 'string' && actionDef.payload.permission) return actionDef.payload.permission;
  return undefined;
}

/**
 * @param {import('./errors.js').ActionErrorCode} code
 * @param {string} message
 * @returns {import('../../types/action.js').UecResult}
 */
function errorResult(code, message) {
  return { success: false, error: { code, message } };
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
 * @returns {ActionEngine}
 */
export function createActionEngine(options) {
  return new ActionEngine(options);
}

export { ActionError };

import { ExecutionError } from './errors.js';

const VALID_KINDS = new Set(['command', 'query', 'action', 'event']);
const ROUTABLE_NAMESPACES = new Set(['action', 'workflow']);

/**
 * Execution Engine (M16) — orchestrates the UP-09 pipeline (Validate →
 * Authorize → Execute → Audit → Respond) over `UecRequest`. It never
 * implements business logic itself: it resolves the target action/workflow
 * definition from the already-hydrated registry, optionally validates the
 * payload via M15, optionally authorizes via M09, then delegates the actual
 * execution to M10 (Action Engine) or M11 (Workflow Engine). Never persists
 * state, never queries Prisma/MMM, never renders UI, never creates a
 * transaction/state/plugin engine of its own.
 * @implements {import('../../types/execution.js').IExecutionEngine}
 */
export class ExecutionEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../action/actionEngine.js').ActionEngine} [options.actionEngine]
   * @param {import('../workflow/workflowEngine.js').WorkflowEngine} [options.workflowEngine]
   * @param {import('../validation/validationEngine.js').ValidationEngine} [options.validationEngine]
   * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
   */
  constructor(options = {}) {
    const { registry, actionEngine, workflowEngine, validationEngine, permissionEngine } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new ExecutionError('MAK-L3-EXECUTION-001', 'ExecutionEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._actionEngine = actionEngine ?? null;
    this._workflowEngine = workflowEngine ?? null;
    this._validationEngine = validationEngine ?? null;
    this._permissionEngine = permissionEngine ?? null;
  }

  /**
   * Runs the full pipeline for a single `UecRequest`. Never throws for
   * expected/business/config conditions — every outcome (structural,
   * authorization, validation, or delegated-engine failure) is returned as
   * a `UecResponse` with `success: false` and a typed `error`, consistent
   * with the `IExecutionEngine` contract (`Promise<UecResponse>`, no
   * separate throw-based error channel).
   * @param {import('../../types/execution.js').UecRequest} request
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} ctx
   * @returns {Promise<import('../../types/execution.js').UecResponse>}
   */
  async execute(request, ctx) {
    if (!request || typeof request !== 'object' || !isNonEmptyString(request.type)) {
      return errorResponse('MAK-L3-EXECUTION-002', 'Invalid UecRequest: missing or invalid "type"');
    }
    if (request.kind !== undefined && !VALID_KINDS.has(request.kind)) {
      return errorResponse('MAK-L3-EXECUTION-002', `Invalid UecRequest kind: ${request.kind}`);
    }
    if (!('payload' in request)) {
      return errorResponse('MAK-L3-EXECUTION-002', 'Invalid UecRequest: missing "payload"');
    }
    if (!hasValidContext(ctx)) {
      return errorResponse('MAK-L3-EXECUTION-002', 'Invalid execution context: missing or malformed accessScope');
    }

    const { namespace, targetId } = splitExecutionType(request.type);
    if (!namespace || !ROUTABLE_NAMESPACES.has(namespace)) {
      return errorResponse(
        'MAK-L3-EXECUTION-003',
        `Unknown execution type: "${request.type}" (expected "action.<id>" or "workflow.<id>")`,
      );
    }
    if (!this._registry.has(namespace, targetId)) {
      return errorResponse('MAK-L3-EXECUTION-003', `Unknown ${namespace}: ${targetId}`);
    }

    const definition = this._registry.resolve(namespace, targetId);

    // Stage 1 — Validate (delegates to M15; never reimplemented here).
    const validationResource = extractValidationResource(definition);
    if (validationResource) {
      if (!this._validationEngine) {
        return errorResponse(
          'MAK-L3-EXECUTION-004',
          `Execution of "${request.type}" requires the Validation Engine but none is wired`,
        );
      }
      let validationResult;
      try {
        validationResult = this._validationEngine.validateRecord(validationResource, request.payload, ctx);
      } catch (err) {
        return errorResponse('MAK-L3-EXECUTION-006', err instanceof Error ? err.message : 'Validation failed to run');
      }
      if (!validationResult.valid) {
        return {
          success: false,
          error: { code: 'MAK-L3-EXECUTION-006', message: `Payload validation failed for "${request.type}"` },
          data: { validation: validationResult },
        };
      }
    }

    // Stage 2 — Authorize (delegates to M09; UEC frozen after this stage).
    const requiredPermission = extractRequiredPermission(definition);
    if (requiredPermission) {
      if (!this._permissionEngine) {
        return errorResponse(
          'MAK-L3-EXECUTION-004',
          `Execution of "${request.type}" requires the Permission Engine but none is wired`,
        );
      }
      const allowed = await this._checkPermission(requiredPermission, ctx);
      if (!allowed) {
        return errorResponse('MAK-L3-EXECUTION-005', `Execution of "${request.type}" denied by Permission Engine`);
      }
    }

    // Stage 3 — Execute (delegate to the already-existing engine; no duplication).
    // Stage 4 (Audit) is out of scope for this slice (no audit sink exists yet — M24 Observability, C.17).
    // Stage 5 — Respond: shape below is the UecResponse returned to the caller.
    if (namespace === 'action') {
      return this._executeAction(targetId, request, ctx);
    }
    return this._executeWorkflow(targetId, request, ctx);
  }

  /**
   * @param {string} actionId
   * @param {import('../../types/execution.js').UecRequest} request
   * @param {unknown} ctx
   */
  async _executeAction(actionId, request, ctx) {
    if (!this._actionEngine) {
      return errorResponse('MAK-L3-EXECUTION-004', `Execution of "${request.type}" requires the Action Engine but none is wired`);
    }
    const result = await this._actionEngine.dispatch({ type: actionId, kind: 'action', payload: request.payload }, ctx);
    return result.success ? { success: true, data: result.data } : { success: false, error: result.error };
  }

  /**
   * @param {string} definitionId
   * @param {import('../../types/execution.js').UecRequest} request
   * @param {unknown} ctx
   */
  async _executeWorkflow(definitionId, request, ctx) {
    if (!this._workflowEngine) {
      return errorResponse(
        'MAK-L3-EXECUTION-004',
        `Execution of "${request.type}" requires the Workflow Engine but none is wired`,
      );
    }
    let instance;
    try {
      instance = await this._workflowEngine.start(definitionId, request.payload, ctx);
    } catch (err) {
      return errorResponse('MAK-L3-EXECUTION-003', err instanceof Error ? err.message : 'Workflow execution failed');
    }
    if (instance.status === 'failed') {
      return {
        success: false,
        error: instance.lastError ?? { code: 'MAK-L3-EXECUTION-003', message: `Workflow "${definitionId}" failed` },
        data: { instance },
      };
    }
    return { success: true, data: { instance } };
  }

  /**
   * @param {string} code Permission code, e.g. "empresa.approve".
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

/** @param {unknown} ctx */
function hasValidContext(ctx) {
  return Boolean(ctx && typeof ctx === 'object');
}

/**
 * Splits a namespaced execution type ("action.empresa.save" /
 * "workflow.empresa_approval") into its routing namespace and the
 * registry-lookup id — matching the handler namespaces documented in
 * platform-protocol/10-UNIVERSAL-HANDLER.md ("action.*" → Action Engine,
 * "workflow.*" → Workflow Engine).
 * @param {string} type
 */
function splitExecutionType(type) {
  const idx = type.indexOf('.');
  if (idx === -1) return { namespace: null, targetId: type };
  return { namespace: type.slice(0, idx), targetId: type.slice(idx + 1) };
}

/**
 * Reads the validation resource code a definition declares, if any.
 * Recognizes `def.validation` or `def.payload.validation`.
 * @param {{validation?: string, payload?: {validation?: string}}} def
 */
function extractValidationResource(def) {
  if (!def) return undefined;
  if (typeof def.validation === 'string' && def.validation) return def.validation;
  if (typeof def.payload?.validation === 'string' && def.payload.validation) return def.payload.validation;
  return undefined;
}

/**
 * Reads the permission code a definition declares, if any.
 * Recognizes `def.permission` or `def.payload.permission`.
 * @param {{permission?: string, payload?: {permission?: string}}} def
 */
function extractRequiredPermission(def) {
  if (!def) return undefined;
  if (typeof def.permission === 'string' && def.permission) return def.permission;
  if (typeof def.payload?.permission === 'string' && def.payload.permission) return def.payload.permission;
  return undefined;
}

/**
 * @param {import('./errors.js').ExecutionErrorCode} code
 * @param {string} message
 * @returns {import('../../types/execution.js').UecResponse}
 */
function errorResponse(code, message) {
  return { success: false, error: { code, message } };
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../action/actionEngine.js').ActionEngine} [options.actionEngine]
 * @param {import('../workflow/workflowEngine.js').WorkflowEngine} [options.workflowEngine]
 * @param {import('../validation/validationEngine.js').ValidationEngine} [options.validationEngine]
 * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
 * @returns {ExecutionEngine}
 */
export function createExecutionEngine(options) {
  return new ExecutionEngine(options);
}

export { ExecutionError };

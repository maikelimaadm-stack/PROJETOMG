import { randomUUID } from 'node:crypto';
import { WorkflowError } from './errors.js';

const VALID_STEP_TYPES = new Set(['action', 'human']);
const TERMINAL_STATUSES = new Set(['completed', 'failed']);

/**
 * Minimal in-memory instance store (FE stub) — swappable via `options.store`
 * for a future BE-backed persistence implementation (D-RI-13: still no
 * direct Prisma/MMM access from the runtime; a real store would call the
 * Internal API, never the database directly).
 */
class InMemoryWorkflowStore {
  constructor() {
    /** @type {Map<string, import('../../types/workflow.js').WorkflowInstance>} */
    this._instances = new Map();
  }

  /** @param {string} instanceId */
  async get(instanceId) {
    return this._instances.get(instanceId) ?? null;
  }

  /** @param {import('../../types/workflow.js').WorkflowInstance} instance */
  async save(instance) {
    this._instances.set(instance.instanceId, instance);
    return instance;
  }
}

/**
 * Workflow Engine (M11) — USM instance start/transition over CRB `workflow`
 * definitions. Action steps delegate to M10 Action Engine (RT-C-11); human
 * steps are queued (stub UI, no render). Never queries Prisma/MMM directly.
 * @implements {import('../../types/workflow.js').IWorkflowEngine}
 */
export class WorkflowEngine {
  /**
   * @param {Object} options
   * @param {import('../registry/registryManager.js').RegistryManager} options.registry
   * @param {import('../action/actionEngine.js').ActionEngine} [options.actionEngine]
   * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
   * @param {{get: Function, save: Function}} [options.store]
   */
  constructor(options = {}) {
    const { registry, actionEngine, permissionEngine, store } = options;
    if (!registry || typeof registry.has !== 'function' || typeof registry.resolve !== 'function') {
      throw new WorkflowError('MAK-L3-WORKFLOW-001', 'WorkflowEngine requires a valid registry (IRegistry) instance');
    }
    this._registry = registry;
    this._actionEngine = actionEngine ?? null;
    this._permissionEngine = permissionEngine ?? null;
    this._store = store ?? new InMemoryWorkflowStore();
  }

  /**
   * @param {string} definitionId
   * @param {object} payload
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} ctx
   * @returns {Promise<import('../../types/workflow.js').WorkflowInstance>}
   */
  async start(definitionId, payload, ctx) {
    if (!isNonEmptyString(definitionId)) {
      throw new WorkflowError('MAK-L3-WORKFLOW-002', 'start() requires a non-empty definitionId');
    }

    const definition = this._loadDefinition(definitionId);

    if (definition.permission) {
      const allowed = await this._checkPermission(definition.permission, ctx);
      if (!allowed) {
        throw new WorkflowError('MAK-L3-WORKFLOW-005', `Workflow "${definitionId}" denied by Permission Engine`);
      }
    }

    const now = nowIso();
    /** @type {import('../../types/workflow.js').WorkflowInstance} */
    let instance = {
      instanceId: randomUUID(),
      definitionId,
      status: 'running',
      stepIndex: 0,
      payload: payload ?? {},
      createdAt: now,
      updatedAt: now,
    };

    instance = await this._runSteps(instance, definition, ctx);
    await this._store.save(instance);
    return instance;
  }

  /**
   * @param {string} instanceId
   * @param {import('../../types/workflow.js').UsmOperation} operation
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} ctx
   * @returns {Promise<import('../../types/workflow.js').WorkflowInstance>}
   */
  async transition(instanceId, operation, ctx) {
    if (!isNonEmptyString(instanceId)) {
      throw new WorkflowError('MAK-L3-WORKFLOW-002', 'transition() requires a non-empty instanceId');
    }
    if (!operation || typeof operation !== 'object' || !isNonEmptyString(operation.type)) {
      throw new WorkflowError('MAK-L3-WORKFLOW-002', 'transition() requires a valid UsmOperation with a "type"');
    }

    const instance = await this._store.get(instanceId);
    if (!instance) {
      throw new WorkflowError('MAK-L3-WORKFLOW-003', `Workflow instance not found: ${instanceId}`);
    }
    if (TERMINAL_STATUSES.has(instance.status)) {
      throw new WorkflowError(
        'MAK-L3-WORKFLOW-006',
        `Workflow instance "${instanceId}" is already terminal (${instance.status})`,
      );
    }

    const definition = this._loadDefinition(instance.definitionId);
    const currentStep = definition.steps[instance.stepIndex];

    if (operation.type !== 'complete-human-step') {
      throw new WorkflowError('MAK-L3-WORKFLOW-006', `Unknown USM operation: ${operation.type}`);
    }
    if (instance.status !== 'waiting' || !currentStep || currentStep.type !== 'human') {
      throw new WorkflowError(
        'MAK-L3-WORKFLOW-006',
        `Workflow instance "${instanceId}" is not waiting on a human step`,
      );
    }

    instance.stepIndex += 1;
    instance.status = 'running';
    instance.updatedAt = nowIso();

    const advanced = await this._runSteps(instance, definition, ctx);
    await this._store.save(advanced);
    return advanced;
  }

  /** @param {string} instanceId */
  async getInstance(instanceId) {
    if (!isNonEmptyString(instanceId)) return null;
    return this._store.get(instanceId);
  }

  /**
   * Loads and structurally validates a workflow definition from the CRB
   * `workflow` registry. Never queries Prisma/MMM — registry only.
   * @param {string} definitionId
   * @returns {import('../../types/workflow.js').WorkflowDefinition}
   */
  _loadDefinition(definitionId) {
    if (!this._registry.has('workflow', definitionId)) {
      throw new WorkflowError('MAK-L3-WORKFLOW-003', `Unknown workflow: ${definitionId}`);
    }

    const record = this._registry.resolve('workflow', definitionId);
    const steps = record?.payload?.steps;
    if (!Array.isArray(steps) || steps.length === 0) {
      throw new WorkflowError(
        'MAK-L3-WORKFLOW-004',
        `Workflow "${definitionId}" has an invalid definition: "steps" must be a non-empty array`,
      );
    }

    for (const step of steps) {
      if (!step || !isNonEmptyString(step.id) || !VALID_STEP_TYPES.has(step.type)) {
        throw new WorkflowError(
          'MAK-L3-WORKFLOW-004',
          `Workflow "${definitionId}" has an invalid or unsupported step: ${JSON.stringify(step)}`,
        );
      }
      if (step.type === 'action' && !isNonEmptyString(step.action)) {
        throw new WorkflowError(
          'MAK-L3-WORKFLOW-004',
          `Workflow "${definitionId}" action step "${step.id}" is missing "action"`,
        );
      }
    }

    return {
      code: record.code ?? definitionId,
      steps,
      permission: typeof record?.payload?.permission === 'string' ? record.payload.permission : undefined,
    };
  }

  /**
   * Advances the instance through steps until it completes, fails, or
   * reaches a human step (queued, stub UI — no render).
   * @param {import('../../types/workflow.js').WorkflowInstance} instance
   * @param {import('../../types/workflow.js').WorkflowDefinition} definition
   * @param {unknown} ctx
   */
  async _runSteps(instance, definition, ctx) {
    while (instance.stepIndex < definition.steps.length) {
      const step = definition.steps[instance.stepIndex];

      if (step.type === 'human') {
        instance.status = 'waiting';
        instance.updatedAt = nowIso();
        return instance;
      }

      // step.type === 'action' — structurally guaranteed by _loadDefinition.
      if (!this._actionEngine) {
        instance.status = 'failed';
        instance.lastError = {
          code: 'MAK-L3-WORKFLOW-004',
          message: `Step "${step.id}" requires an Action Engine but none is wired`,
        };
        instance.updatedAt = nowIso();
        return instance;
      }

      const result = await this._actionEngine.dispatch({ type: step.action, payload: instance.payload }, ctx);
      if (!result.success) {
        instance.status = 'failed';
        instance.lastError = result.error;
        instance.updatedAt = nowIso();
        return instance;
      }

      instance.stepIndex += 1;
      instance.updatedAt = nowIso();
    }

    instance.status = 'completed';
    instance.updatedAt = nowIso();
    return instance;
  }

  /**
   * @param {string} code Permission code, e.g. "empresa.approve".
   * @param {unknown} ctx
   */
  async _checkPermission(code, ctx) {
    if (!this._permissionEngine) return false;
    const idx = code.lastIndexOf('.');
    const resource = idx === -1 ? code : code.slice(0, idx);
    const action = idx === -1 ? 'start' : code.slice(idx + 1);
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

function nowIso() {
  return new Date().toISOString();
}

/**
 * @param {Object} options
 * @param {import('../registry/registryManager.js').RegistryManager} options.registry
 * @param {import('../action/actionEngine.js').ActionEngine} [options.actionEngine]
 * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
 * @returns {WorkflowEngine}
 */
export function createWorkflowEngine(options) {
  return new WorkflowEngine(options);
}

export { WorkflowError };

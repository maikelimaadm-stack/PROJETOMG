/**
 * Workflow Engine types (M11).
 * @see docs/runtime-implementation/03-INTERFACES.md#IWorkflowEngine
 */

/**
 * @typedef {'pending'|'running'|'waiting'|'completed'|'failed'} WorkflowInstanceStatus
 */

/**
 * @typedef {Object} WorkflowStepDefinition
 * @property {string} id
 * @property {'action'|'human'} type
 * @property {string} [action] Required when type === 'action' — matches an M10 action code.
 * @property {string} [label] Human-readable label for 'human' steps.
 */

/**
 * @typedef {Object} WorkflowDefinition
 * @property {string} code
 * @property {WorkflowStepDefinition[]} steps
 * @property {string} [permission] Permission code gating `start()`.
 */

/**
 * @typedef {Object} UsmOperation
 * @property {string} type e.g. "complete-human-step".
 * @property {unknown} [payload]
 */

/**
 * @typedef {Object} WorkflowInstance
 * @property {string} instanceId
 * @property {string} definitionId
 * @property {WorkflowInstanceStatus} status
 * @property {number} stepIndex
 * @property {unknown} payload
 * @property {{code: string, message: string}} [lastError]
 * @property {string} createdAt
 * @property {string} updatedAt
 */

/**
 * @typedef {Object} IWorkflowEngine
 * @property {(definitionId: string, payload: object, ctx: unknown) => Promise<WorkflowInstance>} start
 * @property {(instanceId: string, operation: UsmOperation, ctx: unknown) => Promise<WorkflowInstance>} transition
 * @property {(instanceId: string) => Promise<WorkflowInstance | null>} getInstance
 */

export {};

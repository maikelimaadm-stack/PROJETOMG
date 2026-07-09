/**
 * @typedef {'command'|'query'|'action'|'event'} UecRequestKind
 */

/**
 * @typedef {Object} UecRequest
 * @property {UecRequestKind} [kind]
 * @property {string} type Namespaced execution type — "action.<id>" or "workflow.<id>".
 * @property {unknown} payload
 * @property {string} [idempotencyKey]
 */

/**
 * @typedef {Object} UecError
 * @property {string} code
 * @property {string} message
 */

/**
 * @typedef {Object} UecEvent
 * @property {string} type
 * @property {unknown} payload
 */

/**
 * @typedef {Object} UecResponse
 * @property {boolean} success
 * @property {unknown} [data]
 * @property {UecError} [error]
 * @property {UecEvent[]} [events]
 */

/**
 * Execution Engine (M16) — pipeline orchestrator (UP-09): Validate → Authorize
 * → Execute → Audit → Respond. Delegates to already-existing engines; never
 * duplicates their logic, never persists state, never queries Prisma/MMM.
 * @typedef {Object} IExecutionEngine
 * @property {(request: UecRequest, ctx: unknown) => Promise<UecResponse>} execute
 */

export {};

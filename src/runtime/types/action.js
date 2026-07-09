/**
 * Action Engine types (M10).
 * @see docs/runtime-implementation/03-INTERFACES.md#IActionEngine
 */

/**
 * @typedef {Object} UecCommand
 * @property {'command'|'action'} [kind]
 * @property {string} type Action identifier — matches the CRB `action` registry code.
 * @property {unknown} payload
 * @property {string} [idempotencyKey]
 */

/**
 * @typedef {Object} UecError
 * @property {string} code
 * @property {string} message
 */

/**
 * @typedef {Object} UecResult
 * @property {boolean} success
 * @property {unknown} [data]
 * @property {UecError} [error]
 */

/**
 * @typedef {(payload: unknown, context: unknown, actionDef: Object) => unknown|Promise<unknown>} ActionHandler
 */

/**
 * @typedef {Object} IActionEngine
 * @property {(command: UecCommand, ctx: unknown) => Promise<UecResult>} dispatch
 * @property {(actionId: string, handler: ActionHandler) => void} bind
 */

export {};

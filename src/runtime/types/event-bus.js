/**
 * @typedef {Object} UecEvent
 * @property {string} type
 * @property {unknown} payload
 */

/**
 * @callback EventHandler
 * @param {unknown} payload
 * @param {unknown} [ctx]
 * @returns {unknown}
 */

/**
 * @callback Unsubscribe
 * @returns {void}
 */

/**
 * @typedef {Object} EventHandlerOutcome
 * @property {string} handlerId
 * @property {boolean} success
 * @property {unknown} [value]
 * @property {{message: string}} [error]
 */

/**
 * @typedef {Object} EmitResult
 * @property {string} eventType
 * @property {number} handlerCount
 * @property {EventHandlerOutcome[]} results
 */

/**
 * Event Bus (M22) — in-process, deterministic pub/sub stub (D-RI-08: no
 * broker, no WebSocket, no BroadcastChannel, no worker/thread; production
 * DB-backed transport is Foundation F). Handler failures are captured
 * per-handler in `EmitResult`, never interrupting sibling handlers.
 * @typedef {Object} IEventBus
 * @property {(event: UecEvent, ctx: unknown) => Promise<void>} publish SSOT-literal (03-INTERFACES.md).
 * @property {(eventType: string, handler: EventHandler) => Unsubscribe} subscribe SSOT-literal.
 */

export {};

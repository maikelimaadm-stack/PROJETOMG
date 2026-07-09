/**
 * @typedef {string} StateKey Dot-separated path, e.g. "screen.filters.search".
 */

/**
 * @callback StateListener
 * @param {unknown} value Current value at the subscribed path/key.
 * @returns {void}
 */

/**
 * @callback Unsubscribe
 * @returns {void}
 */

/**
 * @typedef {Object} UsmOperation
 * @property {'set'|'patch'|'reset'} type
 * @property {unknown} [value]
 */

/**
 * @typedef {unknown} UsmState Current value at the transitioned entity path.
 */

/**
 * State Engine (M17) — deterministic, isolated local runtime state store.
 * Not a database, not a transaction engine, not the MMM/USM 20-op lifecycle
 * machine (that remains a Studio/MMM authoring concern). One instance owns
 * one isolated state tree; namespaces/scopes are just top-level path
 * segments within that tree.
 * @typedef {Object} IStateEngine
 * @property {<T>(key: StateKey) => T | undefined} getState
 * @property {<T>(key: StateKey, value: T) => void} setState
 * @property {(key: StateKey, listener: StateListener) => Unsubscribe} subscribe
 * @property {(entityRef: string, operation: UsmOperation) => Promise<UsmState>} transition
 */

export {};

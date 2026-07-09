/**
 * Service Locator types (M20).
 * @see docs/runtime-implementation/03-INTERFACES.md#IServiceLocator
 */

/**
 * @typedef {'singleton'|'scoped'} ServiceLifetime
 */

/**
 * @typedef {string|symbol} ServiceToken
 */

/**
 * @template T
 * @typedef {(context?: unknown) => T} ServiceFactory
 */

/**
 * @typedef {Object} ServiceRegisterOptions
 * @property {ServiceLifetime} [scope] Default 'singleton'.
 * @property {boolean} [override] Allow replacing an existing registration on this node.
 */

/**
 * @typedef {Object} IServiceLocator
 * @property {<T>(token: ServiceToken, factoryOrValue: ServiceFactory<T>|T, options?: ServiceRegisterOptions) => void} register
 * @property {<T>(token: ServiceToken, context?: unknown) => T} resolve
 * @property {(token: ServiceToken) => boolean} has
 * @property {(scopeContext?: unknown) => IServiceLocator} createScope
 * @property {() => void} clear
 */

export {};

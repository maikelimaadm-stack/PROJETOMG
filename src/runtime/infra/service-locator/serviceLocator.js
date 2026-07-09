import { ServiceLocatorError } from './errors.js';

const DEFAULT_SCOPE = 'singleton';
const VALID_SCOPES = new Set(['singleton', 'scoped']);

/**
 * Service Locator (M20) — DI container with singleton/scoped lifetimes.
 * @implements {import('../../types/service-locator.js').IServiceLocator}
 */
export class ServiceLocator {
  /**
   * @param {ServiceLocator | null} [parent]
   */
  constructor(parent = null) {
    /** @type {ServiceLocator | null} */
    this._parent = parent;
    /** @type {Map<import('../../types/service-locator.js').ServiceToken, { factory: unknown, scope: import('../../types/service-locator.js').ServiceLifetime }>} */
    this._registrations = new Map();
    /** Singleton instances are shared across the whole locator tree (root-owned cache). */
    this._singletons = parent ? parent._singletons : new Map();
    /** Scoped instances are local to this node only — never shared with parent or children. */
    this._scopedInstances = new Map();
  }

  /**
   * @template T
   * @param {import('../../types/service-locator.js').ServiceToken} token
   * @param {import('../../types/service-locator.js').ServiceFactory<T>|T} factoryOrValue
   * @param {import('../../types/service-locator.js').ServiceRegisterOptions} [options]
   */
  register(token, factoryOrValue, options = {}) {
    const scope = options.scope ?? DEFAULT_SCOPE;
    if (!VALID_SCOPES.has(scope)) {
      throw new ServiceLocatorError(
        'MAK-L3-LOCATOR-003',
        `Invalid lifetime scope for token "${String(token)}": ${scope}`,
        { token, scope },
      );
    }

    if (this._registrations.has(token) && !options.override) {
      throw new ServiceLocatorError(
        'MAK-L3-LOCATOR-001',
        `Service already registered: ${String(token)}`,
        { token },
      );
    }

    this._registrations.set(token, { factory: factoryOrValue, scope });
    if (options.override) {
      this._singletons.delete(token);
      this._scopedInstances.delete(token);
    }
  }

  /**
   * @param {import('../../types/service-locator.js').ServiceToken} token
   * @returns {{ registration: { factory: unknown, scope: import('../../types/service-locator.js').ServiceLifetime }, owner: ServiceLocator } | null}
   */
  _findRegistration(token) {
    /** @type {ServiceLocator | null} */
    let node = this;
    while (node) {
      if (node._registrations.has(token)) {
        return { registration: node._registrations.get(token), owner: node };
      }
      node = node._parent;
    }
    return null;
  }

  /**
   * @template T
   * @param {import('../../types/service-locator.js').ServiceToken} token
   * @param {unknown} [context]
   * @returns {T}
   */
  resolve(token, context) {
    const found = this._findRegistration(token);
    if (!found) {
      throw new ServiceLocatorError(
        'MAK-L3-LOCATOR-002',
        `Service not registered: ${String(token)}`,
        { token },
      );
    }

    const { factory, scope } = found.registration;

    if (scope === 'singleton') {
      if (this._singletons.has(token)) {
        return this._singletons.get(token);
      }
      const instance = typeof factory === 'function' ? factory(context) : factory;
      this._singletons.set(token, instance);
      return instance;
    }

    // scoped — cached on this node only
    if (this._scopedInstances.has(token)) {
      return this._scopedInstances.get(token);
    }
    const instance = typeof factory === 'function' ? factory(context) : factory;
    this._scopedInstances.set(token, instance);
    return instance;
  }

  /**
   * @param {import('../../types/service-locator.js').ServiceToken} token
   */
  has(token) {
    return this._findRegistration(token) !== null;
  }

  /**
   * @param {unknown} [_scopeContext]
   * @returns {ServiceLocator}
   */
  createScope(_scopeContext) {
    return new ServiceLocator(this);
  }

  /**
   * Clears this node's own registrations and scoped instances.
   * Root-level clear also clears the shared singleton cache.
   */
  clear() {
    this._registrations.clear();
    this._scopedInstances.clear();
    if (!this._parent) {
      this._singletons.clear();
    }
  }
}

/** @returns {ServiceLocator} */
export function createServiceLocator() {
  return new ServiceLocator();
}

/**
 * Kept for backward compatibility with RT-0 bootstrap wiring (C.1–C.4).
 * Internally returns the real ServiceLocator implementation (M20, C.5).
 * @returns {ServiceLocator}
 */
export function createEmptyServiceLocator() {
  return new ServiceLocator();
}

export { ServiceLocatorError };

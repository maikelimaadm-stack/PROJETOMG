import { RouteRegistry } from './RouteRegistry.js';
import { RouteResolver } from './RouteResolver.js';
import { RouteMetadata } from './RouteMetadata.js';
import { RouteLifecycle } from './RouteLifecycle.js';
import { RouteError } from './errors.js';

/**
 * Runtime Router (M08) — route table, URL match, navigation prep. No render.
 */
export class RuntimeRouter {
  constructor() {
    this._registry = new RouteRegistry();
    this._resolver = new RouteResolver(this._registry);
    /** @type {import('./RouteLifecycle.js').RouteState} */
    this._state = RouteLifecycle.PENDING;
    /** @type {import('../../types/router.js').RouteMatch | null} */
    this._currentMatch = null;
    this._lastRegisterMs = 0;
  }

  /**
   * @param {import('../../types/crb.js').CrbPayload} crb
   * @param {string} applicationId
   */
  registerFromCrb(crb, applicationId) {
    const started = performance.now();
    this._state = RouteLifecycle.REGISTERED;

    const entries = RouteMetadata.fromCrb(crb, applicationId);
    for (const entry of entries) {
      this._registry.register(entry);
    }

    this._lastRegisterMs = performance.now() - started;
    this._state = RouteLifecycle.READY;
    return this.buildNavigationTable(applicationId);
  }

  /**
   * @param {import('../../types/router.js').RouteEntry} entry
   */
  registerRoute(entry) {
    this._registry.register(entry);
  }

  /**
   * @param {string} path
   * @param {string} [applicationId]
   * @param {string} [moduleId]
   */
  match(path, applicationId, moduleId) {
    return this._resolver.resolve(path, applicationId, moduleId);
  }

  /**
   * Guard stub — always allow until M09 Permission Engine (C.5).
   * @param {import('../../types/router.js').RouteEntry} _route
   * @param {import('../context/RuntimeContext.js').RuntimeContext} _ctx
   */
  async canActivate(_route, _ctx) {
    return true;
  }

  /**
   * @param {import('../../types/router.js').RouteTarget} target
   * @param {string} [applicationId]
   * @param {string} [moduleId]
   */
  async navigate(target, applicationId, moduleId) {
    const match = this.match(target.path, applicationId, moduleId);
    if (!match) {
      throw new RouteError('MAK-L3-ROUTE-002', `Route not found: ${target.path}`);
    }
    this._currentMatch = Object.freeze({ ...match, params: { ...match.params, ...target.params } });
    return this._currentMatch;
  }

  /**
   * @param {string} applicationId
   */
  buildNavigationTable(applicationId) {
    const routes = this._registry.all(applicationId);
    return Object.freeze({
      routes: Object.freeze([...routes]),
      applicationId,
      routeCount: routes.length,
    });
  }

  get currentMatch() {
    return this._currentMatch;
  }

  get routeCount() {
    return this._registry.size;
  }

  get state() {
    return this._state;
  }

  get lastRegisterMs() {
    return this._lastRegisterMs;
  }
}

/** @returns {RuntimeRouter} */
export function createRuntimeRouter() {
  return new RuntimeRouter();
}

export { RouteError };

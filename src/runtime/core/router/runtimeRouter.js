import { RouteRegistry } from './RouteRegistry.js';
import { RouteResolver } from './RouteResolver.js';
import { RouteMetadata } from './RouteMetadata.js';
import { RouteLifecycle } from './RouteLifecycle.js';
import { RouteError } from './errors.js';

/**
 * Runtime Router (M08) — route table, URL match, navigation prep. No render.
 */
export class RuntimeRouter {
  /**
   * @param {Object} [options]
   * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
   */
  constructor(options = {}) {
    this._registry = new RouteRegistry();
    this._resolver = new RouteResolver(this._registry);
    /** @type {import('./RouteLifecycle.js').RouteState} */
    this._state = RouteLifecycle.PENDING;
    /** @type {import('../../types/router.js').RouteMatch | null} */
    this._currentMatch = null;
    this._lastRegisterMs = 0;
    /** @type {import('../permission/permissionEngine.js').PermissionEngine | null} */
    this._permissionEngine = options.permissionEngine ?? null;
  }

  /**
   * Wires the M09 Permission Engine used by `canActivate()` (RT-5 Authorize).
   * @param {import('../permission/permissionEngine.js').PermissionEngine | null} permissionEngine
   */
  setPermissionEngine(permissionEngine) {
    this._permissionEngine = permissionEngine ?? null;
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
   * RT-5 Authorize — delegates to the M09 Permission Engine. Fail-closed:
   * no engine, no derivable permission code, or engine error all deny.
   * @param {import('../../types/router.js').RouteEntry} route
   * @param {import('../context/RuntimeContext.js').RuntimeContext | { accessScope?: import('../../types/uec.js').AccessScope }} ctx
   * @returns {Promise<boolean>}
   */
  async canActivate(route, ctx) {
    if (!this._permissionEngine) {
      return false;
    }

    const code = RuntimeRouter._derivePermissionCode(route);
    if (!code) {
      return false;
    }

    const idx = code.lastIndexOf('.');
    const resource = idx === -1 ? code : code.slice(0, idx);
    const action = idx === -1 ? 'access' : code.slice(idx + 1);

    try {
      return await this._permissionEngine.can(action, resource, ctx);
    } catch {
      return false;
    }
  }

  /**
   * Resolves the permission code that gates a route: explicit `permission`/
   * `requiredPermission` metadata takes precedence; otherwise falls back to
   * `${moduleId}.access` — the conventional "may enter this route" grant.
   * @param {import('../../types/router.js').RouteEntry} route
   * @returns {string | null}
   */
  static _derivePermissionCode(route) {
    if (typeof route?.permission === 'string' && route.permission) return route.permission;
    if (typeof route?.requiredPermission === 'string' && route.requiredPermission) return route.requiredPermission;
    if (typeof route?.moduleId === 'string' && route.moduleId) return `${route.moduleId}.access`;
    return null;
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

/**
 * @param {Object} [options]
 * @param {import('../permission/permissionEngine.js').PermissionEngine} [options.permissionEngine]
 * @returns {RuntimeRouter}
 */
export function createRuntimeRouter(options) {
  return new RuntimeRouter(options);
}

export { RouteError };

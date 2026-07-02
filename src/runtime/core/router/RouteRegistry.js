import { RouteError } from './errors.js';

/**
 * In-memory route registry — keyed by application + module + path.
 */
export class RouteRegistry {
  constructor() {
    /** @type {Map<string, import('../../types/router.js').RouteEntry>} */
    this._routes = new Map();
  }

  /**
   * @param {import('../../types/router.js').RouteEntry} entry
   */
  register(entry) {
    const key = RouteRegistry.key(entry.applicationId ?? 'app', entry.moduleId ?? 'all', entry.path);
    if (this._routes.has(key)) {
      throw new RouteError('MAK-L3-ROUTE-001', `Route conflict: ${entry.path}`);
    }
    this._routes.set(key, Object.freeze({ ...entry }));
  }

  /**
   * @param {string} [applicationId]
   * @param {string} [moduleId]
   */
  all(applicationId, moduleId) {
    return [...this._routes.values()].filter((route) => {
      if (applicationId && route.applicationId && route.applicationId !== applicationId) return false;
      if (moduleId && route.moduleId && route.moduleId !== moduleId) return false;
      return true;
    });
  }

  get size() {
    return this._routes.size;
  }

  /**
   * @param {string} applicationId
   * @param {string} moduleId
   * @param {string} path
   */
  static key(applicationId, moduleId, path) {
    return `${applicationId}::${moduleId}::${path}`;
  }
}

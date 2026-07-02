import { RouteMatcher } from './RouteMatcher.js';

/**
 * Resolves URL paths to route entries.
 */
export class RouteResolver {
  /**
   * @param {import('./RouteRegistry.js').RouteRegistry} registry
   */
  constructor(registry) {
    this._registry = registry;
  }

  /**
   * @param {string} path
   * @param {string} [applicationId]
   * @param {string} [moduleId]
   * @returns {import('../../types/router.js').RouteMatch | null}
   */
  resolve(path, applicationId, moduleId) {
    const candidates = this._registry.all(applicationId, moduleId);

    for (const entry of candidates) {
      const compiled = RouteMatcher.compile(entry.path);
      const params = RouteMatcher.match(compiled, path);
      if (params !== null) {
        return {
          path: entry.path,
          screenId: entry.screenId ?? entry.objectId,
          layoutId: entry.layoutId,
          params,
          moduleId: entry.moduleId,
        };
      }
    }

    return null;
  }
}

/** Dependency Invalidation — cache invalidation on graph changes (Program 2.3.3) */

export function createDependencyInvalidation(cache) {
  return Object.freeze({
    invalidateNode(cacheKey, nodeId) {
      const invalidated = cache.invalidate(cacheKey);
      const related = cache.invalidate(`${cacheKey}:${nodeId}`);
      return Object.freeze([...new Set([...invalidated, ...related])]);
    },
    invalidateProject(projectId) {
      return cache.invalidate(projectId);
    },
    invalidateAll() {
      return cache.invalidate("*");
    },
  });
}

export default createDependencyInvalidation;

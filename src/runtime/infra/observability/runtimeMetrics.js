/**
 * Runtime quality baseline metrics (Foundation C.3+).
 * @param {Partial<import('../../types/metrics.js').RuntimeMetricsSnapshot>} partial
 * @returns {import('../../types/metrics.js').RuntimeMetricsSnapshot}
 */
export function captureRuntimeMetrics(partial = {}) {
  const mem = process.memoryUsage();
  return Object.freeze({
    bootstrapMs: partial.bootstrapMs ?? 0,
    crbLoadMs: partial.crbLoadMs ?? 0,
    hydrationMs: partial.hydrationMs ?? 0,
    dependencyResolveMs: partial.dependencyResolveMs ?? 0,
    dagBuildMs: partial.dagBuildMs ?? 0,
    routeRegisterMs: partial.routeRegisterMs ?? 0,
    registryObjectCount: partial.registryObjectCount ?? 0,
    routeCount: partial.routeCount ?? 0,
    dependencyCount: partial.dependencyCount ?? 0,
    graphMaxDepth: partial.graphMaxDepth ?? 0,
    validationsExecuted: partial.validationsExecuted ?? 0,
    memoryUsageMb: Math.round((mem.heapUsed / 1024 / 1024) * 100) / 100,
    testCount: partial.testCount ?? 0,
  });
}

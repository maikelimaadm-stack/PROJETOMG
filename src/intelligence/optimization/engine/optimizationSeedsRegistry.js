import { listOptimizationLoops } from "./optimizationEngineStore.js";

export function buildOptimizationSeedsRegistry(tenantId = "default") {
  const loops = listOptimizationLoops(tenantId, { limit: 10 });
  return Object.freeze({
    tenantId,
    seedCount: loops.length,
    seeds: Object.freeze(loops.map((l) => Object.freeze({ loopId: l.loopId, title: l.title }))),
    explainable: true,
  });
}

export default buildOptimizationSeedsRegistry;

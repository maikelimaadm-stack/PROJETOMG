import {
  listOptimizationLoops,
  listOptimizationSignals,
  listOptimizationOpportunities,
  listOptimizationPlans,
  listOptimizationMilestones,
  listOptimizationBenchmarks,
} from "./optimizationEngineStore.js";
import { explainOptimizationLoop } from "./optimizationExplainability.js";

export function retrieveOptimizationsByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    loops: listOptimizationLoops(tenantId, { limit }),
    signals: listOptimizationSignals(tenantId, { limit: 50 }),
    opportunities: listOptimizationOpportunities(tenantId, { limit }),
    plans: listOptimizationPlans(tenantId, { limit }),
    milestones: listOptimizationMilestones(tenantId, { limit: 30 }),
    benchmarks: listOptimizationBenchmarks(tenantId, { limit }),
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export function retrieveLatestOptimizations(tenantId = "default") {
  const retrieved = retrieveOptimizationsByContext(tenantId);
  return Object.freeze({
    ...retrieved,
    topLoop: retrieved.loops[0] ?? null,
    explainability: Object.freeze({
      top: retrieved.loops[0] ? explainOptimizationLoop(retrieved.loops[0]) : null,
    }),
  });
}

export default { retrieveOptimizationsByContext, retrieveLatestOptimizations };

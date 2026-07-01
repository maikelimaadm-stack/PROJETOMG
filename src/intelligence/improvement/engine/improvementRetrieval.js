import {
  listImprovementLoops,
  listImprovementSignals,
  listImprovementOpportunities,
  listImprovementPlans,
  listImprovementMilestones,
  listImprovementBenchmarks,
} from "./improvementEngineStore.js";
import { explainImprovementLoop } from "./improvementExplainability.js";

export function retrieveImprovementsByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    loops: listImprovementLoops(tenantId, { limit }),
    signals: listImprovementSignals(tenantId, { limit: 50 }),
    opportunities: listImprovementOpportunities(tenantId, { limit }),
    plans: listImprovementPlans(tenantId, { limit }),
    milestones: listImprovementMilestones(tenantId, { limit: 30 }),
    benchmarks: listImprovementBenchmarks(tenantId, { limit }),
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export function retrieveLatestImprovements(tenantId = "default") {
  const retrieved = retrieveImprovementsByContext(tenantId);
  return Object.freeze({
    ...retrieved,
    topLoop: retrieved.loops[0] ?? null,
    explainability: Object.freeze({
      top: retrieved.loops[0] ? explainImprovementLoop(retrieved.loops[0]) : null,
    }),
  });
}

export default { retrieveImprovementsByContext, retrieveLatestImprovements };

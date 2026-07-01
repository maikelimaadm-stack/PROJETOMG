import {
  listRecommendations,
  listRecommendationSignals,
  listRecommendationCandidates,
  listRecommendationPlans,
  listReplications,
  listReplicationTargets,
  listReplicationPlans,
} from "./recommendationEngineStore.js";
import { explainRecommendation, explainReplication } from "./recommendationExplainability.js";

export function retrieveRecommendationsByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    recommendations: listRecommendations(tenantId, { limit }),
    signals: listRecommendationSignals(tenantId, { limit: 50 }),
    candidates: listRecommendationCandidates(tenantId, { limit }),
    plans: listRecommendationPlans(tenantId, { limit }),
    explainable: true,
    humanApprovalRequired: true,
    individualProfilingForbidden: true,
  });
}

export function retrieveReplicationsByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    replications: listReplications(tenantId, { limit }),
    targets: listReplicationTargets(tenantId, { limit }),
    plans: listReplicationPlans(tenantId, { limit }),
    explainable: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export function retrieveLatestRecommendations(tenantId = "default") {
  const retrieved = retrieveRecommendationsByContext(tenantId);
  return Object.freeze({
    ...retrieved,
    topRecommendation: retrieved.recommendations[0] ?? null,
    explainability: Object.freeze({
      top: retrieved.recommendations[0]
        ? explainRecommendation(retrieved.recommendations[0])
        : null,
    }),
  });
}

export default { retrieveRecommendationsByContext, retrieveReplicationsByContext, retrieveLatestRecommendations };

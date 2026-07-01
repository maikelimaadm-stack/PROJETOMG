import { retrieveRecommendationsByContext } from "./recommendationRetrieval.js";
import { RECOMMENDATION_OWNERSHIP } from "./recommendationEngineContracts.js";

export function summarizeRecommendationEngine(tenantId = "default") {
  const retrieved = retrieveRecommendationsByContext(tenantId);
  const top = retrieved.recommendations[0];
  const highPriority = retrieved.recommendations.filter((r) => r.priority === "high");

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    recommendationCount: retrieved.recommendations.length,
    signalCount: retrieved.signals.length,
    planCount: retrieved.plans.length,
    highPriorityCount: highPriority.length,
    headline: top
      ? `Recomendação prioritária: ${top.title}`
      : "Recomendações de melhoria serão geradas a partir do contexto operacional da empresa.",
    topRecommendation: top?.title ?? null,
    explainable: true,
    belongsToEnterprise: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
    ...RECOMMENDATION_OWNERSHIP,
  });
}

export default summarizeRecommendationEngine;

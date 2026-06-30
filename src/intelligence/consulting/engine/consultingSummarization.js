import {
  listConsultingDocuments,
  listConsultingRecommendations,
  listImprovementPlans,
  listEngineConsultingSignals,
} from "./consultingEngineStore.js";

export function summarizeConsultingEngine(tenantId = "default") {
  const documents = listConsultingDocuments(tenantId, { limit: 500 });
  const recommendations = listConsultingRecommendations(tenantId, { limit: 200 });
  const plans = listImprovementPlans(tenantId, { limit: 100 });
  const signals = listEngineConsultingSignals(tenantId, { limit: 300 });

  const byPriority = {};
  for (const rec of recommendations) {
    byPriority[rec.priority] = (byPriority[rec.priority] ?? 0) + 1;
  }

  const highPriority = recommendations.filter((r) => r.priority === "high" || r.priority === "critical");

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    documentCount: documents.length,
    recommendationCount: recommendations.length,
    planCount: plans.length,
    signalCount: signals.length,
    highPriorityCount: highPriority.length,
    byPriority: Object.freeze(byPriority),
    headline:
      recommendations.length === 0
        ? "A consultoria operacional está pronta para analisar memória e conhecimento da empresa."
        : `${recommendations.length} recomendações explicáveis e ${plans.length} planos de melhoria disponíveis.`,
    explainable: true,
    aiGenerated: false,
    belongsToEnterprise: true,
    autonomousExecutionForbidden: true,
  });
}

export default summarizeConsultingEngine;

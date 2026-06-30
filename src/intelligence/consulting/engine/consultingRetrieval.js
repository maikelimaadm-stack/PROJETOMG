import {
  listConsultingDocuments,
  listConsultingRecommendations,
  listImprovementPlans,
  listEngineConsultingSignals,
} from "./consultingEngineStore.js";

export function retrieveConsultingByContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const documents = listConsultingDocuments(tenantId, { limit });
  const recommendations = listConsultingRecommendations(tenantId, { limit });
  const plans = listImprovementPlans(tenantId, { limit: options.planLimit ?? 5 });
  const signals = listEngineConsultingSignals(tenantId, { limit });

  let filtered = recommendations;
  if (options.priority) {
    filtered = filtered.filter((r) => r.priority === options.priority);
  }
  if (options.confidence) {
    filtered = filtered.filter((r) => r.confidence === options.confidence);
  }

  return Object.freeze({
    tenantId,
    retrievedAt: new Date().toISOString(),
    documents,
    recommendations: filtered,
    plans,
    signals,
    explainable: true,
  });
}

export default retrieveConsultingByContext;

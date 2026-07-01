import { listRecommendations } from "./recommendationEngineStore.js";

export function getRecommendationRegistry(tenantId = "default") {
  const recommendations = listRecommendations(tenantId, { limit: 100 });
  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    count: recommendations.length,
    recommendations: Object.freeze(recommendations),
    explainable: true,
  });
}

export default getRecommendationRegistry;

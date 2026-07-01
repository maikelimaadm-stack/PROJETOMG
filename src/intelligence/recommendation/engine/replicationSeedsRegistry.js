import { summarizeRecommendationEngine } from "./recommendationSummarization.js";
import { listRecommendations } from "./recommendationEngineStore.js";

const seedLog = [];

export function registerReplicationSeed(tenantId, seed = {}) {
  const record = Object.freeze({
    seedId: seed.seedId ?? `rseed-${tenantId}-${Date.now()}`,
    tenantId,
    recommendationId: seed.recommendationId ?? null,
    source: seed.source ?? "segmentation_to_recommendation_ingestion",
    registeredAt: new Date().toISOString(),
  });
  seedLog.unshift(record);
  return record;
}

export function buildReplicationSeedsRegistry(tenantId = "default") {
  const summary = summarizeRecommendationEngine(tenantId);
  const recommendations = listRecommendations(tenantId, { limit: 10 });

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    seedCount: recommendations.length,
    recommendationSeeds: recommendations.map((r) =>
      Object.freeze({ id: r.recommendationId, title: r.title })
    ),
    summary,
  });
}

export default { registerReplicationSeed, buildReplicationSeedsRegistry };

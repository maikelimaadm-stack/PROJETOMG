/**
 * Segmentation → Recommendation & Replication ingestion.
 */
import { assembleRecommendationContext } from "./recommendationContextAssembly.js";
import { registerRecommendationSignals } from "./recommendationSignals.js";
import { buildRecommendationCandidates } from "./recommendationCandidates.js";
import { buildRecommendationPlans } from "./recommendationPlans.js";
import { buildReplicationTargets } from "./replicationTargets.js";
import { buildReplicationPlans } from "./replicationPlans.js";
import { explainRecommendation } from "./recommendationExplainability.js";
import { registerReplicationSeed } from "./replicationSeedsRegistry.js";
import { appendRecommendationAuditEntry } from "./recommendationAuditTrail.js";
import { RECOMMENDATION_ENGINE_VERSION, RECOMMENDATION_OWNERSHIP } from "./recommendationEngineContracts.js";

export function analyzeRecommendationContext(tenantId = "default", options = {}) {
  const ctx = assembleRecommendationContext(tenantId, options);
  const signals = registerRecommendationSignals(tenantId, ctx);
  const candidates = buildRecommendationCandidates(tenantId, ctx, signals);
  const { recommendations, plans } = buildRecommendationPlans(tenantId, candidates);
  const replicationTargets = buildReplicationTargets(tenantId, ctx, options.groupId ?? null);
  const replicationResult = buildReplicationPlans(tenantId, replicationTargets, recommendations);

  if (recommendations[0]) {
    registerReplicationSeed(tenantId, {
      recommendationId: recommendations[0].recommendationId,
      source: "segmentation_to_recommendation_ingestion",
    });
  }

  appendRecommendationAuditEntry({
    tenantId,
    action: "recommendation_analyzed",
    entityId: recommendations[0]?.recommendationId ?? null,
    entityType: "analysis",
  });

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: RECOMMENDATION_ENGINE_VERSION,
    signals,
    candidates,
    recommendations,
    plans,
    replicationTargets,
    replications: replicationResult.replications,
    replicationPlans: replicationResult.plans,
    explainability: Object.freeze({
      top: recommendations[0] ? explainRecommendation(recommendations[0]) : null,
    }),
    ...RECOMMENDATION_OWNERSHIP,
    explainable: true,
  });
}

export function ingestSegmentationToRecommendation(tenantId = "default", options = {}) {
  return analyzeRecommendationContext(tenantId, options);
}

export function replayRecommendationFromStack(tenantId = "default", options = {}) {
  return analyzeRecommendationContext(tenantId, options);
}

export default {
  analyzeRecommendationContext,
  ingestSegmentationToRecommendation,
  replayRecommendationFromStack,
};

/**
 * Recommendation & Replication Engine orchestrator.
 */
import { RECOMMENDATION_ENGINE_VERSION, REPLICATION_ENGINE_VERSION } from "./recommendationEngineContracts.js";
import { getRecommendationEngineStoreInfo } from "./recommendationEngineStore.js";
import { summarizeRecommendationEngine } from "./recommendationSummarization.js";
import { summarizeReplicationEngine } from "./replicationSummarization.js";
import { assembleRecommendationContext } from "./recommendationContextAssembly.js";
import { buildRecommendationBosProjection, buildReplicationBosProjection } from "./recommendationToBosProjection.js";
import {
  bridgeRecommendationToConsulting,
  bridgeRecommendationToDecision,
  bridgeRecommendationToEvolution,
} from "./recommendationToIntelligenceBridges.js";
import { buildReplicationSeedsRegistry } from "./replicationSeedsRegistry.js";
import { getRecommendationRegistry } from "./recommendationRegistry.js";
import { getReplicationRegistry } from "./replicationRegistry.js";

export function runRecommendationEngine(tenantId = "default", options = {}) {
  return Object.freeze({
    engineVersion: RECOMMENDATION_ENGINE_VERSION,
    replicationEngineVersion: REPLICATION_ENGINE_VERSION,
    tenantId,
    storeInfo: getRecommendationEngineStoreInfo(),
    summary: summarizeRecommendationEngine(tenantId),
    replicationSummary: summarizeReplicationEngine(tenantId),
    context: assembleRecommendationContext(tenantId, options),
    bosProjection: buildRecommendationBosProjection(tenantId, options),
    replicationBosProjection: buildReplicationBosProjection(tenantId, options),
    recommendationRegistry: getRecommendationRegistry(tenantId),
    replicationRegistry: getReplicationRegistry(tenantId),
    seeds: buildReplicationSeedsRegistry(tenantId),
    consultingBridge: bridgeRecommendationToConsulting(tenantId),
    decisionBridge: bridgeRecommendationToDecision(tenantId),
    evolutionBridge: bridgeRecommendationToEvolution(tenantId),
    recommendationEngineReady: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default runRecommendationEngine;

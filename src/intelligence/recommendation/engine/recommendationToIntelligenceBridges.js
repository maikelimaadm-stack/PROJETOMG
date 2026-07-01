import { summarizeRecommendationEngine } from "./recommendationSummarization.js";
import { retrieveLatestRecommendations } from "./recommendationRetrieval.js";
import { runAdoptionEngine } from "../../adoption/engine/runAdoptionEngine.js";

export function bridgeRecommendationToConsulting(tenantId = "default") {
  const summary = summarizeRecommendationEngine(tenantId);
  const retrieved = retrieveLatestRecommendations(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    recommendationContext: summary.headline,
    topRecommendations: retrieved.recommendations.slice(0, 3),
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
  });
}

export function bridgeRecommendationToDecision(tenantId = "default") {
  const summary = summarizeRecommendationEngine(tenantId);
  const retrieved = retrieveLatestRecommendations(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    pendingRecommendations: retrieved.recommendations.filter((r) => r.lifecycleState === "proposed"),
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
    humanApprovalRequired: true,
  });
}

export function bridgeRecommendationToEvolution(tenantId = "default") {
  const summary = summarizeRecommendationEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    evolutionTargets: summary.highPriorityCount,
    recommendationSummary: summary.headline,
    evolutionBridgeReady: false,
    autonomousEvolutionForbidden: true,
  });
}

export function bridgeRecommendationToAdoption(tenantId = "default") {
  const adoption = runAdoptionEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    adoptionSummary: adoption.summary?.headline,
    adoptionEngineReady: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default {
  bridgeRecommendationToConsulting,
  bridgeRecommendationToDecision,
  bridgeRecommendationToEvolution,
  bridgeRecommendationToAdoption,
};

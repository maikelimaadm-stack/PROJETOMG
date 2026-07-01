import { summarizeImprovementEngine } from "./improvementSummarization.js";
import { retrieveLatestImprovements } from "./improvementRetrieval.js";
import { runRecommendationEngine } from "../../recommendation/engine/runRecommendationEngine.js";
import { runAdoptionEngine } from "../../adoption/engine/runAdoptionEngine.js";

export function bridgeImprovementToRecommendation(tenantId = "default") {
  const recommendation = runRecommendationEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    recommendationContext: recommendation.summary?.headline,
    improvementBridgeReady: false,
    autonomousRecommendationForbidden: true,
  });
}

export function bridgeImprovementToAdoption(tenantId = "default") {
  const adoption = runAdoptionEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    adoptionSummary: adoption.summary?.headline,
    improvementBridgeReady: false,
    readOnly: true,
  });
}

export function bridgeImprovementToConsulting(tenantId = "default") {
  const summary = summarizeImprovementEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    improvementContext: summary.headline,
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
  });
}

export function bridgeImprovementToDecision(tenantId = "default") {
  const retrieved = retrieveLatestImprovements(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    pendingOpportunities: retrieved.opportunities.slice(0, 3),
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
    humanApprovalRequired: true,
  });
}

export function bridgeImprovementToEvolution(tenantId = "default") {
  const summary = summarizeImprovementEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    validatedImpactCount: summary.validatedImpactCount,
    improvementSummary: summary.headline,
    evolutionBridgeReady: false,
    autonomousEvolutionForbidden: true,
  });
}

export default {
  bridgeImprovementToRecommendation,
  bridgeImprovementToAdoption,
  bridgeImprovementToConsulting,
  bridgeImprovementToDecision,
  bridgeImprovementToEvolution,
};

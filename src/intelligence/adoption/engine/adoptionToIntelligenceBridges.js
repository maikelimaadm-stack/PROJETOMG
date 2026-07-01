import { summarizeAdoptionEngine } from "./adoptionSummarization.js";
import { retrieveLatestAdoptions } from "./adoptionRetrieval.js";

export function bridgeAdoptionToConsulting(tenantId = "default") {
  const summary = summarizeAdoptionEngine(tenantId);
  const retrieved = retrieveLatestAdoptions(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    adoptionContext: summary.headline,
    inProgressAdoptions: retrieved.statusBreakdown.inProgress.slice(0, 3),
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
  });
}

export function bridgeAdoptionToDecision(tenantId = "default") {
  const retrieved = retrieveLatestAdoptions(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    pendingAdoptions: retrieved.statusBreakdown.pending.slice(0, 3),
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
    humanApprovalRequired: true,
  });
}

export function bridgeAdoptionToEvolution(tenantId = "default") {
  const summary = summarizeAdoptionEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    validatedOutcomes: summary.validatedOutcomeCount,
    adoptionSummary: summary.headline,
    evolutionBridgeReady: false,
    autonomousEvolutionForbidden: true,
  });
}

export default {
  bridgeAdoptionToConsulting,
  bridgeAdoptionToDecision,
  bridgeAdoptionToEvolution,
};

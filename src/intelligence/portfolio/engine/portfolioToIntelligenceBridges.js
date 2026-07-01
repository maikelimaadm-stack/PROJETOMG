/**
 * Portfolio Intelligence → intelligence stack bridges (read-only).
 * @see Program 3.22
 */
import { summarizePortfolioIntelligenceEngine } from "./portfolioSummarization.js";
import { retrieveLatestPortfolioIntelligence } from "./portfolioRetrieval.js";
import { runConsultingEngine } from "../../consulting/engine/runConsultingEngine.js";
import { runDecisionEngine } from "../../decision/engine/runDecisionEngine.js";
import { runEvolutionEngine } from "../../evolution/engine/runEvolutionEngine.js";

export function bridgePortfolioToConsulting(groupId, tenantId = "default") {
  const summary = summarizePortfolioIntelligenceEngine(groupId);
  const consulting = runConsultingEngine(tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    portfolioContext: summary.headline,
    consultingContext: consulting.summary?.headline,
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
    readOnly: true,
  });
}

export function bridgePortfolioToDecision(groupId, tenantId = "default") {
  const retrieved = retrieveLatestPortfolioIntelligence(groupId);
  const decision = runDecisionEngine(tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    portfolioOpportunities: retrieved.opportunities.slice(0, 3),
    decisionContext: decision.summary?.headline,
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
    humanApprovalRequired: true,
    readOnly: true,
  });
}

export function bridgePortfolioToEvolution(groupId, tenantId = "default") {
  const summary = summarizePortfolioIntelligenceEngine(groupId);
  const evolution = runEvolutionEngine(tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    portfolioSummary: summary.headline,
    evolutionContext: evolution.summary?.headline,
    evolutionBridgeReady: false,
    autonomousEvolutionForbidden: true,
    readOnly: true,
  });
}

export default {
  bridgePortfolioToConsulting,
  bridgePortfolioToDecision,
  bridgePortfolioToEvolution,
};

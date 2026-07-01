/**
 * Governance → intelligence stack bridges (read-only).
 * @see Program 3.23
 */
import { summarizePlatformGovernanceEngine } from "./governanceSummarization.js";
import { retrieveLatestGovernance } from "./governanceRetrieval.js";
import { runConsultingEngine } from "../../consulting/engine/runConsultingEngine.js";
import { runDecisionEngine } from "../../decision/engine/runDecisionEngine.js";
import { runPortfolioIntelligenceEngine } from "../../portfolio/engine/runPortfolioIntelligenceEngine.js";

export function bridgeGovernanceToConsulting(groupId, tenantId = "default") {
  const summary = summarizePlatformGovernanceEngine(groupId);
  const consulting = runConsultingEngine(tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    governanceContext: summary.headline,
    consultingContext: consulting.summary?.headline,
    consultingBridgeReady: false,
    autonomousAdviceForbidden: true,
    readOnly: true,
  });
}

export function bridgeGovernanceToDecision(groupId, tenantId = "default") {
  const retrieved = retrieveLatestGovernance(groupId);
  const decision = runDecisionEngine(tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    governancePolicies: retrieved.policies.slice(0, 3),
    decisionContext: decision.summary?.headline,
    decisionBridgeReady: false,
    autonomousDecisionForbidden: true,
    humanApprovalRequired: true,
    readOnly: true,
  });
}

export function bridgeGovernanceToPortfolioIntelligence(groupId, tenantId = "default") {
  const governance = summarizePlatformGovernanceEngine(groupId);
  const portfolio = runPortfolioIntelligenceEngine(groupId, tenantId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    governanceSummary: governance.headline,
    portfolioSummary: portfolio.summary?.headline,
    portfolioBridgeReady: portfolio.authorized,
    readOnly: true,
    explainable: true,
  });
}

export default {
  bridgeGovernanceToConsulting,
  bridgeGovernanceToDecision,
  bridgeGovernanceToPortfolioIntelligence,
};

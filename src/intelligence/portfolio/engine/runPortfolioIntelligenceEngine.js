/**
 * Portfolio Intelligence Engine orchestrator.
 * @see Program 3.22
 */
import { PORTFOLIO_INTELLIGENCE_VERSION } from "./portfolioIntelligenceContracts.js";
import { getPortfolioIntelligenceStoreInfo } from "./portfolioIntelligenceStore.js";
import { summarizePortfolioIntelligenceEngine } from "./portfolioSummarization.js";
import { assemblePortfolioContext } from "./portfolioContextAssembly.js";
import { buildPortfolioIntelligenceBosProjection } from "./portfolioToBosProjection.js";
import { retrieveLatestPortfolioIntelligence } from "./portfolioRetrieval.js";
import { authorizePortfolioScope } from "./portfolioScopeAuthorization.js";

export function runPortfolioIntelligenceEngine(groupId, tenantId = "default", options = {}) {
  const auth = authorizePortfolioScope(groupId, tenantId);
  return Object.freeze({
    engineVersion: PORTFOLIO_INTELLIGENCE_VERSION,
    groupId,
    tenantId,
    authorized: auth.authorized,
    storeInfo: getPortfolioIntelligenceStoreInfo(),
    summary: summarizePortfolioIntelligenceEngine(groupId),
    context: assemblePortfolioContext(groupId, tenantId, options),
    bosProjection: buildPortfolioIntelligenceBosProjection(groupId, tenantId, options),
    registry: retrieveLatestPortfolioIntelligence(groupId),
    portfolioIntelligenceReady: auth.authorized,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    individualProfilingForbidden: true,
    surveillanceForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default runPortfolioIntelligenceEngine;

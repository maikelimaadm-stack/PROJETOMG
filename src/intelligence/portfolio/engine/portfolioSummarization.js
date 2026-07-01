import { retrievePortfolioByContext } from "./portfolioRetrieval.js";
import { PORTFOLIO_OWNERSHIP } from "./portfolioIntelligenceContracts.js";

export function summarizePortfolioIntelligenceEngine(groupId) {
  const retrieved = retrievePortfolioByContext(groupId);
  const headline =
    retrieved.views.length > 0
      ? `Command Center: ${retrieved.benchmarks.length} benchmarks, ${retrieved.opportunities.length} oportunidades, ${retrieved.alerts.length} alertas`
      : "Portfolio Intelligence será consolidada quando escopo de grupo estiver autorizado.";

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    viewCount: retrieved.views.length,
    benchmarkCount: retrieved.benchmarks.length,
    opportunityCount: retrieved.opportunities.length,
    alertCount: retrieved.alerts.length,
    referenceCount: retrieved.references.length,
    varianceCount: retrieved.variances.length,
    headline,
    explainable: true,
    belongsToEnterprise: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    ...PORTFOLIO_OWNERSHIP,
  });
}

export default summarizePortfolioIntelligenceEngine;

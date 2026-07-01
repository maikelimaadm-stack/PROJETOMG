import {
  listPortfolioViews,
  listPortfolioDashboards,
  listPortfolioBenchmarks,
  listPortfolioPatterns,
  listPortfolioOpportunities,
  listPortfolioReferences,
  listPortfolioVariances,
  listPortfolioAlerts,
  listPortfolioRankings,
} from "./portfolioIntelligenceStore.js";
import { explainPortfolioView } from "./portfolioExplainability.js";

export function retrievePortfolioByContext(groupId, options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    groupId,
    retrievedAt: new Date().toISOString(),
    views: listPortfolioViews(groupId, { limit: 5 }),
    dashboards: listPortfolioDashboards(groupId, { limit: 5 }),
    benchmarks: listPortfolioBenchmarks(groupId, { limit }),
    patterns: listPortfolioPatterns(groupId, { limit }),
    opportunities: listPortfolioOpportunities(groupId, { limit }),
    references: listPortfolioReferences(groupId, { limit }),
    variances: listPortfolioVariances(groupId, { limit }),
    alerts: listPortfolioAlerts(groupId, { limit: 10 }),
    rankings: listPortfolioRankings(groupId, { limit: 10 }),
    explainable: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
  });
}

export function retrieveLatestPortfolioIntelligence(groupId) {
  const retrieved = retrievePortfolioByContext(groupId);
  const topView = retrieved.views[0];
  return Object.freeze({
    ...retrieved,
    topView,
    explainability: Object.freeze({
      top: topView ? explainPortfolioView(topView) : null,
    }),
  });
}

export default { retrievePortfolioByContext, retrieveLatestPortfolioIntelligence };

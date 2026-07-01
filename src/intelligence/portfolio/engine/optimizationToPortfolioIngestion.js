/**
 * Optimization → Portfolio Intelligence ingestion — authorized group scope only.
 * @see Program 3.22
 */
import { assemblePortfolioContext } from "./portfolioContextAssembly.js";
import { aggregatePortfolioHealth } from "./portfolioHealthAggregation.js";
import { aggregatePortfolioMaturity } from "./portfolioMaturityAggregation.js";
import { aggregatePortfolioEvolution } from "./portfolioEvolutionAggregation.js";
import { aggregatePortfolioRecommendations } from "./portfolioRecommendationAggregation.js";
import { aggregatePortfolioAdoption } from "./portfolioAdoptionAggregation.js";
import { aggregatePortfolioImprovement } from "./portfolioImprovementAggregation.js";
import { aggregatePortfolioOptimization } from "./portfolioOptimizationAggregation.js";
import { buildPortfolioComparison } from "./portfolioComparisonEngine.js";
import { buildPortfolioBenchmarkRegistry } from "./portfolioBenchmarkRegistry.js";
import { buildPortfolioPatternRegistry } from "./portfolioPatternRegistry.js";
import { buildPortfolioOpportunityRegistry } from "./portfolioOpportunityRegistry.js";
import { buildPortfolioReferenceRegistry } from "./portfolioReferenceRegistry.js";
import { buildPortfolioVarianceRegistry } from "./portfolioVarianceRegistry.js";
import { buildPortfolioAlertRegistry } from "./portfolioAlertRegistry.js";
import { buildPortfolioRanking } from "./portfolioRankingEngine.js";
import { buildPortfolioSummary } from "./portfolioSummaryEngine.js";
import { buildAuthorizedGroupDashboard } from "./authorizedGroupDashboard.js";
import { buildCorporateCommandCenterView } from "./corporateCommandCenterView.js";
import { buildMultiCompanyHealthView } from "./multiCompanyHealthView.js";
import { buildCrossCompanyTrendView } from "./crossCompanyTrendView.js";
import { buildReferenceCompanyView } from "./referenceCompanyView.js";
import { buildCorporateStandardizationView } from "./corporateStandardizationView.js";
import { buildGroupCapabilityRadar } from "./groupCapabilityRadar.js";
import { buildGroupEvolutionTimeline } from "./groupEvolutionTimeline.js";
import { createPortfolioView, upsertPortfolioView, upsertPortfolioDashboard } from "./portfolioIntelligenceStore.js";
import { buildPortfolioLineage } from "./portfolioLineage.js";
import { registerPortfolioVersion } from "./portfolioVersioning.js";
import { appendPortfolioAuditEntry } from "./portfolioAuditTrail.js";
import { PORTFOLIO_INTELLIGENCE_VERSION, PORTFOLIO_OWNERSHIP } from "./portfolioIntelligenceContracts.js";

export function analyzePortfolioIntelligenceContext(groupId, tenantId = "default", options = {}) {
  const ctx = assemblePortfolioContext(groupId, tenantId, options);

  if (!ctx.authorized) {
    return Object.freeze({
      groupId,
      tenantId,
      analyzedAt: new Date().toISOString(),
      authorized: false,
      reason: ctx.reason,
      ...PORTFOLIO_OWNERSHIP,
    });
  }

  const health = aggregatePortfolioHealth(groupId, ctx);
  const maturity = aggregatePortfolioMaturity(groupId, tenantId, ctx);
  const evolution = aggregatePortfolioEvolution(groupId, ctx);
  const recommendations = aggregatePortfolioRecommendations(groupId, ctx);
  const adoption = aggregatePortfolioAdoption(groupId, ctx);
  const improvement = aggregatePortfolioImprovement(groupId, ctx);
  const optimization = aggregatePortfolioOptimization(groupId, ctx);
  const comparison = buildPortfolioComparison(groupId, ctx, health, maturity);
  const benchmarks = buildPortfolioBenchmarkRegistry(groupId, ctx, health, maturity);
  const patterns = buildPortfolioPatternRegistry(groupId, ctx);
  const opportunities = buildPortfolioOpportunityRegistry(groupId, ctx, comparison);
  const references = buildPortfolioReferenceRegistry(groupId, ctx, comparison);
  const variances = buildPortfolioVarianceRegistry(groupId, ctx, comparison);
  const alerts = buildPortfolioAlertRegistry(groupId, ctx, comparison);
  const ranking = buildPortfolioRanking(groupId, ctx, comparison);
  const summary = buildPortfolioSummary(groupId, ctx, health, comparison, ranking);

  const dashboard = buildAuthorizedGroupDashboard(groupId, tenantId, ctx, summary, health, ranking);
  const commandCenter = buildCorporateCommandCenterView(
    groupId,
    tenantId,
    ctx,
    summary,
    health,
    maturity,
    evolution,
    comparison,
    ranking
  );
  const multiHealth = buildMultiCompanyHealthView(groupId, tenantId, health, comparison);
  const trends = buildCrossCompanyTrendView(groupId, tenantId, evolution, maturity);
  const referenceView = buildReferenceCompanyView(groupId, tenantId, references, comparison);
  const standardization = buildCorporateStandardizationView(groupId, tenantId, patterns, opportunities, variances);
  const capabilityRadar = buildGroupCapabilityRadar(groupId, tenantId, maturity, ctx);
  const evolutionTimeline = buildGroupEvolutionTimeline(groupId, tenantId, evolution, ctx);

  const view = upsertPortfolioView(
    createPortfolioView({
      viewId: `pview-${groupId}-${Date.now()}`,
      groupId,
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      title: "Command Center Corporativo",
      summary: summary.headline,
      lifecycleState: "aggregated",
      lineage: buildPortfolioLineage({
        groupId,
        improvementRef: options.optimizationLoopId ?? options.loops?.[0]?.loopId ?? null,
      }),
    })
  );

  registerPortfolioVersion(groupId, view.viewId);

  upsertPortfolioDashboard(
    Object.freeze({
      dashboardId: `pdash-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      title: dashboard.title,
      summary: summary.headline,
      healthScore: health.healthScore,
      maturityScore: maturity.averageMaturityScore,
      atRiskCount: comparison.belowStandard?.filter((c) => c.atRisk)?.length ?? 0,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendPortfolioAuditEntry({
    groupId,
    action: "portfolio_intelligence_analyzed",
    entityId: view.viewId,
    entityType: "view",
  });

  return Object.freeze({
    groupId,
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: PORTFOLIO_INTELLIGENCE_VERSION,
    authorized: true,
    view,
    summary,
    health,
    maturity,
    evolution,
    recommendations,
    adoption,
    improvement,
    optimization,
    comparison,
    benchmarks,
    patterns,
    opportunities,
    references,
    variances,
    alerts,
    ranking,
    dashboard,
    commandCenter,
    multiHealth,
    trends,
    referenceView,
    standardization,
    capabilityRadar,
    evolutionTimeline,
    ...PORTFOLIO_OWNERSHIP,
    explainable: true,
  });
}

export function ingestOptimizationToPortfolio(groupId, tenantId = "default", options = {}) {
  return analyzePortfolioIntelligenceContext(groupId, tenantId, options);
}

export default { analyzePortfolioIntelligenceContext, ingestOptimizationToPortfolio };

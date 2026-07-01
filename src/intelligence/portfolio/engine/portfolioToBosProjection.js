/**
 * Portfolio Intelligence → BOS projection — business vocabulary only.
 * @see Program 3.22
 */
import { summarizePortfolioIntelligenceEngine } from "./portfolioSummarization.js";
import { retrieveLatestPortfolioIntelligence } from "./portfolioRetrieval.js";
import { analyzePortfolioIntelligenceContext } from "./optimizationToPortfolioIngestion.js";
import { explainPortfolioView, explainPortfolioComparison } from "./portfolioExplainability.js";

export function buildPortfolioIntelligenceBosProjection(groupId, tenantId = "default", options = {}) {
  if (!groupId) {
    return Object.freeze({
      hasPortfolioIntelligence: false,
      authorized: false,
      summary: "Command Center corporativo requer escopo de grupo autorizado.",
      explainable: true,
    });
  }

  let summary = summarizePortfolioIntelligenceEngine(groupId);
  if (summary.viewCount === 0) {
    analyzePortfolioIntelligenceContext(groupId, tenantId, options);
    summary = summarizePortfolioIntelligenceEngine(groupId);
  }

  const retrieved = retrieveLatestPortfolioIntelligence(groupId);
  const latestAnalysis = analyzePortfolioIntelligenceContext(groupId, tenantId, options);

  const commandCenter = latestAnalysis.authorized
    ? Object.freeze({
        label: latestAnalysis.commandCenter?.title ?? "Command Center Corporativo",
        context: latestAnalysis.summary?.headline ?? summary.headline,
        healthScore: latestAnalysis.health?.healthScore ?? 0,
        maturityScore: latestAnalysis.maturity?.averageMaturityScore ?? 0,
        companyCount: latestAnalysis.summary?.tenantCount ?? 0,
        atRiskCount: latestAnalysis.summary?.atRiskCount ?? 0,
        because: "Consolidação apenas de empresas autorizadas do mesmo cliente — decisão final é humana.",
      })
    : null;

  const companyHealth = latestAnalysis.authorized
    ? (latestAnalysis.multiHealth?.companies ?? []).map((c) =>
        Object.freeze({
          id: c.tenantId,
          label: c.label,
          healthScore: c.healthScore,
          isCurrentTenant: c.isCurrentTenant,
        })
      )
    : [];

  const rankings = latestAnalysis.authorized
    ? (latestAnalysis.ranking?.rankings?.[0]?.entries ?? []).slice(0, 5).map((e) =>
        Object.freeze({
          id: e.tenantId,
          label: e.label,
          rank: e.rank,
          score: e.score,
          isCurrentTenant: e.isCurrentTenant,
        })
      )
    : [];

  const references = retrieved.references.slice(0, 3).map((r) =>
    Object.freeze({
      id: r.referenceId,
      label: r.label,
      processArea: r.processArea,
      context: r.summary,
    })
  );

  const variances = retrieved.variances.slice(0, 3).map((v) =>
    Object.freeze({
      id: v.varianceId,
      label: v.label,
      context: v.summary,
      because: explainPortfolioComparison({ label: v.label, healthScore: 0, vsGroupHealth: v.deviationType })?.because,
    })
  );

  const opportunities = retrieved.opportunities.slice(0, 3).map((o) =>
    Object.freeze({
      id: o.opportunityId,
      label: o.label,
      context: o.summary,
      priority: o.priority,
    })
  );

  const alerts = retrieved.alerts.slice(0, 5).map((a) =>
    Object.freeze({
      id: a.alertId,
      label: a.title,
      context: a.summary ?? a.title,
      severity: a.severity,
    })
  );

  const benchmarks = retrieved.benchmarks.slice(0, 3).map((b) =>
    Object.freeze({
      id: b.benchmarkId,
      label: b.label,
      value: b.referenceValue,
      context: b.summary,
    })
  );

  const trends = latestAnalysis.authorized
    ? (latestAnalysis.trends?.trends ?? []).slice(0, 5).map((t) =>
        Object.freeze({
          id: t.label,
          label: t.label,
          context: t.headline,
          maturityLevel: t.maturityLevel,
        })
      )
    : [];

  const standardization = latestAnalysis.authorized
    ? (latestAnalysis.standardization?.patterns ?? []).slice(0, 3).map((p) =>
        Object.freeze({
          id: p.label,
          label: p.label,
          context: p.context,
        })
      )
    : [];

  const capabilityRadar = latestAnalysis.authorized
    ? Object.freeze({
        groupScore: latestAnalysis.capabilityRadar?.groupMaturityScore ?? 0,
        companies: (latestAnalysis.capabilityRadar?.companies ?? []).slice(0, 5).map((c) =>
          Object.freeze({ label: c.label, maturityLevel: c.maturityLevel })
        ),
      })
    : null;

  const evolutionTimeline = latestAnalysis.authorized
    ? (latestAnalysis.evolutionTimeline?.milestones ?? []).slice(0, 5).map((m) =>
        Object.freeze({ id: m.label, label: m.label, context: m.headline })
      )
    : [];

  const topView = retrieved.views[0];
  const explained = topView ? explainPortfolioView(topView) : null;

  return Object.freeze({
    hasPortfolioIntelligence: summary.viewCount > 0 || latestAnalysis.authorized === true,
    authorized: latestAnalysis.authorized === true,
    summary: summary.headline,
    portfolioSummary: summary,
    commandCenter,
    companyHealth,
    portfolioRankings: rankings,
    portfolioReferences: references,
    portfolioVariances: variances,
    portfolioOpportunities: opportunities,
    portfolioAlerts: alerts,
    portfolioBenchmarks: benchmarks,
    portfolioTrends: trends,
    corporateStandardization: standardization,
    groupCapabilityRadar: capabilityRadar,
    groupEvolutionTimeline: evolutionTimeline,
    leaderCompany: latestAnalysis.ranking?.leader ?? null,
    belowStandardCount: latestAnalysis.summary?.belowStandardCount ?? 0,
    aboveStandardCount: latestAnalysis.summary?.aboveStandardCount ?? 0,
    explainability: explained,
    explainable: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    individualProfilingForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildPortfolioIntelligenceBosProjection;

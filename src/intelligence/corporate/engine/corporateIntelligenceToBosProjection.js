/**
 * Corporate Intelligence → BOS projection — business vocabulary only.
 */
import { summarizeCorporateIntelligenceEngine } from "./corporateIntelligenceSummarization.js";
import { retrieveLatestCorporateIntelligence } from "./corporateIntelligenceRetrieval.js";
import { analyzeCorporateIntelligenceContext } from "./adoptionToCorporateIngestion.js";
import { buildGroupAdoptionComparison } from "./groupAdoptionComparison.js";
import { buildAuthorizedGroupInsights } from "./authorizedGroupInsights.js";
import { explainCorporateIntelligence, explainCorporateVariance } from "./corporateIntelligenceExplainability.js";

export function buildCorporateIntelligenceBosProjection(groupId, tenantId = "default", options = {}) {
  if (!groupId) {
    return Object.freeze({
      hasCorporateIntelligence: false,
      authorized: false,
      summary: "Visão corporativa requer escopo de grupo autorizado.",
      explainable: true,
    });
  }

  let summary = summarizeCorporateIntelligenceEngine(groupId);
  if (summary.viewCount === 0) {
    analyzeCorporateIntelligenceContext(groupId, tenantId, options);
    summary = summarizeCorporateIntelligenceEngine(groupId);
  }

  const retrieved = retrieveLatestCorporateIntelligence(groupId);
  const groupComparison = buildGroupAdoptionComparison(groupId, tenantId);
  const insights = buildAuthorizedGroupInsights(groupId, tenantId);

  const corporateView = retrieved.views[0]
    ? (() => {
        const explained = explainCorporateIntelligence(retrieved.views[0]);
        return Object.freeze({
          id: retrieved.views[0].viewId,
          label: retrieved.views[0].title,
          context: retrieved.views[0].summary,
          because: explained.because,
          authorizedTenantCount: explained.authorizedTenantCount,
        });
      })()
    : null;

  const benchmarks = retrieved.benchmarks.slice(0, 3).map((b) =>
    Object.freeze({
      id: b.benchmarkId,
      label: b.label,
      value: b.referenceValue,
      context: b.summary,
    })
  );

  const references = retrieved.references.slice(0, 3).map((r) =>
    Object.freeze({
      id: r.referenceId,
      label: r.label,
      processArea: r.processArea,
      context: r.summary,
    })
  );

  const variances = retrieved.variances.slice(0, 3).map((v) => {
    const explained = explainCorporateVariance(v);
    return Object.freeze({
      id: v.varianceId,
      label: v.label,
      context: v.summary,
      because: explained.because,
    });
  });

  const opportunities = retrieved.opportunities.slice(0, 3).map((o) =>
    Object.freeze({
      id: o.opportunityId,
      label: o.label,
      context: o.summary,
      priority: o.priority,
    })
  );

  const companyComparisons = groupComparison.authorized
    ? groupComparison.comparisons.map((c) =>
        Object.freeze({
          id: c.tenantId,
          label: c.label,
          progressPercent: c.progressPercent,
          acceptedCount: c.acceptedCount,
          isCurrentTenant: c.isCurrentTenant,
        })
      )
    : [];

  const groupInsights = insights.authorized
    ? insights.insights.map((i) =>
        Object.freeze({
          id: i.id,
          label: i.label,
          value: i.value,
          because: i.because,
        })
      )
    : [];

  return Object.freeze({
    hasCorporateIntelligence: summary.viewCount > 0,
    authorized: groupComparison.authorized,
    summary: summary.headline,
    corporateSummary: summary,
    corporateView,
    benchmarks,
    references,
    variances,
    opportunities,
    companyComparisons,
    groupInsights,
    healthScore: summary.healthScore,
    leaderCompany: groupComparison.leader ?? null,
    belowStandardCompany: groupComparison.belowStandard ?? null,
    explainable: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default buildCorporateIntelligenceBosProjection;

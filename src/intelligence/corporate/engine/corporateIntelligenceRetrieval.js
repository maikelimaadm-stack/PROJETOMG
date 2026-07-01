import {
  listCorporateViews,
  listCorporateBenchmarks,
  listCorporatePatterns,
  listCorporateReferences,
  listCorporateVariances,
  listCorporateOpportunities,
  listCorporateHealthRecords,
} from "./corporateIntelligenceStore.js";
import { explainCorporateIntelligence, explainCorporateVariance } from "./corporateIntelligenceExplainability.js";

export function retrieveCorporateIntelligenceByContext(groupId, options = {}) {
  const limit = options.limit ?? 20;
  return Object.freeze({
    groupId,
    retrievedAt: new Date().toISOString(),
    views: listCorporateViews(groupId, { limit: 5 }),
    benchmarks: listCorporateBenchmarks(groupId, { limit }),
    patterns: listCorporatePatterns(groupId, { limit }),
    references: listCorporateReferences(groupId, { limit }),
    variances: listCorporateVariances(groupId, { limit }),
    opportunities: listCorporateOpportunities(groupId, { limit }),
    healthRecords: listCorporateHealthRecords(groupId, { limit: 5 }),
    explainable: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
  });
}

export function retrieveLatestCorporateIntelligence(groupId) {
  const retrieved = retrieveCorporateIntelligenceByContext(groupId);
  const topView = retrieved.views[0];
  return Object.freeze({
    ...retrieved,
    topView,
    explainability: Object.freeze({
      top: topView ? explainCorporateIntelligence(topView) : null,
      topVariance: retrieved.variances[0] ? explainCorporateVariance(retrieved.variances[0]) : null,
    }),
  });
}

export default { retrieveCorporateIntelligenceByContext, retrieveLatestCorporateIntelligence };

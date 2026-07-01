import { retrieveCorporateIntelligenceByContext } from "./corporateIntelligenceRetrieval.js";
import { CORPORATE_OWNERSHIP } from "./corporateIntelligenceContracts.js";

export function summarizeCorporateIntelligenceEngine(groupId) {
  const retrieved = retrieveCorporateIntelligenceByContext(groupId);
  const health = retrieved.healthRecords[0];

  const headline = health
    ? `Saúde corporativa: ${health.healthScore}% — ${retrieved.benchmarks.length} referências, ${retrieved.opportunities.length} oportunidades`
    : "Inteligência corporativa será consolidada quando escopo de grupo estiver autorizado.";

  return Object.freeze({
    groupId,
    summarizedAt: new Date().toISOString(),
    viewCount: retrieved.views.length,
    benchmarkCount: retrieved.benchmarks.length,
    patternCount: retrieved.patterns.length,
    varianceCount: retrieved.variances.length,
    opportunityCount: retrieved.opportunities.length,
    healthScore: health?.healthScore ?? null,
    headline,
    explainable: true,
    belongsToEnterprise: true,
    unauthorizedAggregationForbidden: true,
    crossTenantMixingForbidden: true,
    ...CORPORATE_OWNERSHIP,
  });
}

export default summarizeCorporateIntelligenceEngine;

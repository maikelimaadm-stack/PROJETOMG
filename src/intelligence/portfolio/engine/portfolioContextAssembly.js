import { authorizePortfolioScope } from "./portfolioScopeAuthorization.js";
import { summarizeBusinessDnaEngine } from "../../dna/engine/businessDnaSummarization.js";
import { summarizeSegmentationEngine } from "../../segmentation/engine/segmentationSummarization.js";
import { summarizeRecommendationEngine } from "../../recommendation/engine/recommendationSummarization.js";
import { summarizeAdoptionEngine } from "../../adoption/engine/adoptionSummarization.js";
import { summarizeImprovementEngine } from "../../improvement/engine/improvementSummarization.js";
import { summarizeOptimizationEngine } from "../../optimization/engine/optimizationSummarization.js";
import { summarizeEvolutionEngine } from "../../evolution/engine/evolutionSummarization.js";
import { summarizeCorporateIntelligenceEngine } from "../../corporate/engine/corporateIntelligenceSummarization.js";

export function assemblePortfolioContext(groupId, tenantId = "default", options = {}) {
  const auth = authorizePortfolioScope(groupId, tenantId);
  if (!auth.authorized) {
    return Object.freeze({ ...auth, assembledAt: new Date().toISOString() });
  }

  const tenantSummaries = auth.authorizedTenantIds.map((tid) =>
    Object.freeze({
      tenantId: tid,
      isCurrentTenant: tid === tenantId,
      dna: summarizeBusinessDnaEngine(tid),
      segmentation: summarizeSegmentationEngine(tid),
      recommendation: summarizeRecommendationEngine(tid),
      adoption: summarizeAdoptionEngine(tid),
      improvement: summarizeImprovementEngine(tid),
      optimization: summarizeOptimizationEngine(tid),
      evolution: summarizeEvolutionEngine(tid),
    })
  );

  return Object.freeze({
    ...auth,
    assembledAt: new Date().toISOString(),
    tenantSummaries: Object.freeze(tenantSummaries),
    corporateSummary: summarizeCorporateIntelligenceEngine(groupId),
    explainable: true,
    belongsToEnterprise: true,
    crossTenantMixingForbidden: true,
  });
}

export default assemblePortfolioContext;

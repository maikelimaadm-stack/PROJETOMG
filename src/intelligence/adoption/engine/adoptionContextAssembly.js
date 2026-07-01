import { assembleRecommendationContext } from "../../recommendation/engine/recommendationContextAssembly.js";
import { summarizeRecommendationEngine } from "../../recommendation/engine/recommendationSummarization.js";
import { retrieveLatestRecommendations } from "../../recommendation/engine/recommendationRetrieval.js";
import { summarizeBusinessDnaEngine } from "../../dna/engine/businessDnaSummarization.js";
import { summarizeSegmentationEngine } from "../../segmentation/engine/segmentationSummarization.js";
import { summarizeConsultingEngine } from "../../consulting/engine/consultingSummarization.js";
import { summarizeDecisionEngine } from "../../decision/engine/decisionSummarization.js";
import { summarizeEvolutionEngine } from "../../evolution/engine/evolutionSummarization.js";

/** Assemble adoption context from Recommendation + full intelligence stack */
export function assembleAdoptionContext(tenantId = "default", options = {}) {
  const recommendationContext = assembleRecommendationContext(tenantId, options);
  const recommendationSummary = summarizeRecommendationEngine(tenantId);
  const recommendationRetrieved = retrieveLatestRecommendations(tenantId);
  const dnaSummary = summarizeBusinessDnaEngine(tenantId);
  const segmentationSummary = summarizeSegmentationEngine(tenantId);
  const consultingSummary = summarizeConsultingEngine(tenantId);
  const decisionSummary = summarizeDecisionEngine(tenantId);
  const evolutionSummary = summarizeEvolutionEngine(tenantId);

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    recommendationContext,
    recommendationSummary,
    recommendationRetrieved,
    dnaSummary,
    segmentationSummary,
    consultingSummary,
    decisionSummary,
    evolutionSummary,
    recommendations: recommendationRetrieved.recommendations ?? [],
    replicationPlans: recommendationRetrieved.plans ?? [],
    explainable: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
  });
}

export default assembleAdoptionContext;

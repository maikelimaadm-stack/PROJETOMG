import { assembleSegmentationContext } from "../../segmentation/engine/segmentationContextAssembly.js";
import { summarizeSegmentationEngine } from "../../segmentation/engine/segmentationSummarization.js";
import { retrieveLatestSegmentation } from "../../segmentation/engine/segmentationRetrieval.js";
import { summarizeBusinessDnaEngine } from "../../dna/engine/businessDnaSummarization.js";
import { summarizeConsultingEngine } from "../../consulting/engine/consultingSummarization.js";
import { summarizeDecisionEngine } from "../../decision/engine/decisionSummarization.js";
import { summarizeEvolutionEngine } from "../../evolution/engine/evolutionSummarization.js";
import { computeAdvancedMaturityScore } from "../../segmentation/engine/advancedMaturityScoring.js";
import { buildCorporatePatternSuggestions } from "../../segmentation/engine/corporatePatternSuggestions.js";

/** Assemble recommendation context from DNA + Segmentation + full stack */
export function assembleRecommendationContext(tenantId = "default", options = {}) {
  const segmentationContext = assembleSegmentationContext(tenantId);
  const segmentationSummary = summarizeSegmentationEngine(tenantId);
  const segmentationRetrieved = retrieveLatestSegmentation(tenantId);
  const dnaSummary = summarizeBusinessDnaEngine(tenantId);
  const consultingSummary = summarizeConsultingEngine(tenantId);
  const decisionSummary = summarizeDecisionEngine(tenantId);
  const evolutionSummary = summarizeEvolutionEngine(tenantId);
  const advancedMaturity = computeAdvancedMaturityScore(tenantId);

  let corporatePatterns = null;
  if (options.groupId) {
    corporatePatterns = buildCorporatePatternSuggestions(options.groupId, tenantId);
  }

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    segmentationContext,
    segmentationSummary,
    segmentationRetrieved,
    dnaSummary,
    consultingSummary,
    decisionSummary,
    evolutionSummary,
    advancedMaturity,
    corporatePatterns,
    templateMatches: segmentationRetrieved.templateMatches ?? [],
    gaps: dnaSummary.gaps ?? [],
    strengths: dnaSummary.strengths ?? [],
    segmentLabel: segmentationSummary.segmentLabel,
    explainable: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    humanApprovalRequired: true,
  });
}

export default assembleRecommendationContext;

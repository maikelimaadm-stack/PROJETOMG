import { retrieveSegmentationByContext } from "./segmentationRetrieval.js";
import { summarizeTemplateLibrary } from "./templateSummarization.js";
import { computeAdvancedMaturityScore } from "./advancedMaturityScoring.js";
import { SEGMENTATION_OWNERSHIP } from "./segmentationEngineContracts.js";

export function summarizeSegmentationEngine(tenantId = "default") {
  const retrieved = retrieveSegmentationByContext(tenantId);
  const templateSummary = summarizeTemplateLibrary(tenantId);
  const advanced = computeAdvancedMaturityScore(tenantId);
  const profile = retrieved.profiles[0];
  const classification = retrieved.classifications[0];

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    profileCount: retrieved.profiles.length,
    classificationCount: retrieved.classifications.length,
    templateMatchCount: retrieved.templateMatches.length,
    segmentLabel: classification?.segmentLabel ?? profile?.segmentLabel ?? "Em classificação",
    segmentId: classification?.segmentId ?? profile?.segmentId ?? null,
    advancedMaturityScore: advanced.advancedScore,
    priorityDomains: advanced.priorityDomains,
    topTemplate: templateSummary.topTemplate,
    headline: classification
      ? `Segmento operacional: ${classification.segmentLabel}. ${classification.because ?? ""}`
      : "Segmentação operacional em formação a partir do Business DNA.",
    explainable: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    autonomousExecutionForbidden: true,
    ...SEGMENTATION_OWNERSHIP,
  });
}

export default summarizeSegmentationEngine;

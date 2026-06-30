/**
 * Segmentation → BOS projection — business vocabulary only.
 */
import { summarizeSegmentationEngine } from "./segmentationSummarization.js";
import { retrieveLatestSegmentation } from "./segmentationRetrieval.js";
import { analyzeSegmentationContext } from "./dnaToSegmentationIngestion.js";
import { buildAdvancedMaturityRadar } from "./advancedMaturityRadar.js";
import { compareMaturityProgress } from "./maturityProgressComparison.js";
import { buildAuthorizedGroupComparison } from "./authorizedGroupComparison.js";
import { buildCorporatePatternSuggestions } from "./corporatePatternSuggestions.js";
import { summarizeTemplateLibrary } from "./templateSummarization.js";

export function buildSegmentationBosProjection(tenantId = "default", options = {}) {
  let summary = summarizeSegmentationEngine(tenantId);
  if (summary.profileCount === 0) {
    analyzeSegmentationContext(tenantId, options);
    summary = summarizeSegmentationEngine(tenantId);
  }

  const retrieved = retrieveLatestSegmentation(tenantId);
  const radar = buildAdvancedMaturityRadar(tenantId);
  const progress = compareMaturityProgress(tenantId, options.groupId ?? null);
  const templateSummary = summarizeTemplateLibrary(tenantId);

  const compatibleTemplates = retrieved.templateMatches.slice(0, 5).map((m) =>
    Object.freeze({
      id: m.templateId,
      label: m.templateLabel,
      compatibility: m.compatibilityScore,
      context: m.summary,
      expectedImpact: m.expectedImpact,
    })
  );

  const benchmarks = retrieved.benchmarks.slice(0, 3).map((b) =>
    Object.freeze({
      id: b.benchmarkId,
      label: b.label,
      score: b.advancedScore,
      context: b.because,
    })
  );

  let groupComparison = null;
  let patternSuggestions = null;
  if (options.groupId) {
    groupComparison = buildAuthorizedGroupComparison(options.groupId, tenantId);
    patternSuggestions = buildCorporatePatternSuggestions(options.groupId, tenantId);
  }

  return Object.freeze({
    hasSegmentation: summary.profileCount > 0 || summary.classificationCount > 0,
    summary: summary.headline,
    segmentationSummary: summary,
    segmentLabel: summary.segmentLabel,
    segmentNarrative: retrieved.classification?.because ?? summary.headline,
    compatibleTemplates,
    maturityRadar: radar,
    advancedMaturityScore: summary.advancedMaturityScore,
    priorityCapabilities: summary.priorityDomains,
    maturityProgress: progress,
    benchmarks,
    accelerationSuggestions: compatibleTemplates.slice(0, 3).map((t) =>
      Object.freeze({
        id: t.id,
        label: t.label,
        because: `Template ${t.label} acelera evolução com ${t.compatibility}% de compatibilidade.`,
      })
    ),
    groupComparison,
    patternSuggestions,
    templateHeadline: templateSummary.headline,
    explainable: true,
    individualProfilingForbidden: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildSegmentationBosProjection;

/**
 * Business DNA → Segmentation ingestion — tenant-scoped classification.
 */
import { assembleSegmentationContext } from "./segmentationContextAssembly.js";
import { buildSegmentationProfile } from "./segmentationProfiles.js";
import { matchTemplatesToSegment } from "./templateMatching.js";
import { buildAdvancedMaturityRadar } from "./advancedMaturityRadar.js";
import { buildMaturityBenchmarks } from "./maturityBenchmarks.js";
import { compareMaturityProgress } from "./maturityProgressComparison.js";
import { explainSegmentationProfile } from "./segmentationExplainability.js";
import { registerSegmentSeed } from "./segmentSeedsRegistry.js";
import { appendSegmentationAuditEntry } from "./segmentationAuditTrail.js";
import { SEGMENTATION_ENGINE_VERSION, SEGMENTATION_OWNERSHIP } from "./segmentationEngineContracts.js";
import { ingestSegmentationToRecommendation } from "../../recommendation/engine/segmentationToRecommendationIngestion.js";

export function analyzeSegmentationContext(tenantId = "default", options = {}) {
  const ctx = assembleSegmentationContext(tenantId);
  const segmentResult = buildSegmentationProfile(ctx);
  const templateMatches = matchTemplatesToSegment(
    tenantId,
    segmentResult.segmentId,
    ctx.gaps ?? []
  );
  const maturityRadar = buildAdvancedMaturityRadar(tenantId);
  const benchmarks = buildMaturityBenchmarks(tenantId, options.groupId ?? null);
  const progressComparison = compareMaturityProgress(tenantId, options.groupId ?? null);

  registerSegmentSeed(tenantId, {
    segmentId: segmentResult.segmentId,
    source: "dna_to_segmentation_ingestion",
  });

  appendSegmentationAuditEntry({
    tenantId,
    action: "segmentation_analyzed",
    entityId: segmentResult.profile.profileId,
    entityType: "analysis",
  });

  try {
    ingestSegmentationToRecommendation(tenantId, options);
  } catch {
    // non-blocking — recommendation must not break segmentation pipeline
  }

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    engineVersion: SEGMENTATION_ENGINE_VERSION,
    segment: segmentResult,
    templateMatches,
    maturityRadar,
    benchmarks,
    progressComparison,
    explainability: Object.freeze({
      profile: explainSegmentationProfile(segmentResult.profile),
    }),
    ...SEGMENTATION_OWNERSHIP,
    explainable: true,
  });
}

export function ingestDnaToSegmentation(tenantId = "default", options = {}) {
  return analyzeSegmentationContext(tenantId, options);
}

export function replaySegmentationFromStack(tenantId = "default", options = {}) {
  return analyzeSegmentationContext(tenantId, options);
}

export default { analyzeSegmentationContext, ingestDnaToSegmentation, replaySegmentationFromStack };

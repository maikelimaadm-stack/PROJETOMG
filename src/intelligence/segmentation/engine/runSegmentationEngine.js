/**
 * Business Segmentation Engine orchestrator — tenant-owned classification & templates.
 */
import { SEGMENTATION_ENGINE_VERSION } from "./segmentationEngineContracts.js";
import { getSegmentationEngineStoreInfo } from "./segmentationEngineStore.js";
import { summarizeSegmentationEngine } from "./segmentationSummarization.js";
import { assembleSegmentationContext } from "./segmentationContextAssembly.js";
import { buildSegmentationBosProjection } from "./segmentationToBosProjection.js";
import {
  bridgeSegmentationToConsulting,
  bridgeSegmentationToDecision,
  bridgeSegmentationToEvolution,
} from "./segmentationToIntelligenceBridges.js";
import { buildSegmentSeedsRegistry } from "./segmentSeedsRegistry.js";
import { buildTemplateLibrary } from "./templateLibrary.js";

export function runSegmentationEngine(tenantId = "default", options = {}) {
  return Object.freeze({
    engineVersion: SEGMENTATION_ENGINE_VERSION,
    tenantId,
    storeInfo: getSegmentationEngineStoreInfo(),
    summary: summarizeSegmentationEngine(tenantId),
    context: assembleSegmentationContext(tenantId),
    bosProjection: buildSegmentationBosProjection(tenantId, options),
    templateLibrary: buildTemplateLibrary(),
    seeds: buildSegmentSeedsRegistry(tenantId),
    consultingBridge: bridgeSegmentationToConsulting(tenantId),
    decisionBridge: bridgeSegmentationToDecision(tenantId),
    evolutionBridge: bridgeSegmentationToEvolution(tenantId),
    segmentationEngineReady: true,
    individualProfilingForbidden: true,
    autonomousExecutionForbidden: true,
  });
}

export default runSegmentationEngine;

/**
 * Continuous Improvement Engine orchestrator.
 */
import { IMPROVEMENT_ENGINE_VERSION } from "./improvementEngineContracts.js";
import { getImprovementEngineStoreInfo } from "./improvementEngineStore.js";
import { summarizeImprovementEngine } from "./improvementSummarization.js";
import { assembleImprovementContext } from "./improvementContextAssembly.js";
import { buildImprovementBosProjection } from "./improvementToBosProjection.js";
import {
  bridgeImprovementToRecommendation,
  bridgeImprovementToAdoption,
  bridgeImprovementToConsulting,
  bridgeImprovementToDecision,
  bridgeImprovementToEvolution,
} from "./improvementToIntelligenceBridges.js";
import { buildImprovementSeedsRegistry } from "./improvementSeedsRegistry.js";
import { trackImprovementProgress } from "./improvementTracking.js";

export function runImprovementEngine(tenantId = "default", options = {}) {
  return Object.freeze({
    engineVersion: IMPROVEMENT_ENGINE_VERSION,
    tenantId,
    storeInfo: getImprovementEngineStoreInfo(),
    summary: summarizeImprovementEngine(tenantId),
    context: assembleImprovementContext(tenantId, options),
    bosProjection: buildImprovementBosProjection(tenantId, options),
    seeds: buildImprovementSeedsRegistry(tenantId),
    tracking: trackImprovementProgress(tenantId),
    recommendationBridge: bridgeImprovementToRecommendation(tenantId),
    adoptionBridge: bridgeImprovementToAdoption(tenantId),
    consultingBridge: bridgeImprovementToConsulting(tenantId),
    decisionBridge: bridgeImprovementToDecision(tenantId),
    evolutionBridge: bridgeImprovementToEvolution(tenantId),
    improvementEngineReady: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default runImprovementEngine;

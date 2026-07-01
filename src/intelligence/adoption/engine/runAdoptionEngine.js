/**
 * Adoption Tracking Engine orchestrator.
 */
import { ADOPTION_ENGINE_VERSION } from "./adoptionEngineContracts.js";
import { getAdoptionEngineStoreInfo } from "./adoptionEngineStore.js";
import { summarizeAdoptionEngine } from "./adoptionSummarization.js";
import { assembleAdoptionContext } from "./adoptionContextAssembly.js";
import { buildAdoptionBosProjection } from "./adoptionToBosProjection.js";
import {
  bridgeAdoptionToConsulting,
  bridgeAdoptionToDecision,
  bridgeAdoptionToEvolution,
} from "./adoptionToIntelligenceBridges.js";
import { getAdoptionRegistry } from "./adoptionRegistry.js";
import { buildAdoptionTimeline } from "./adoptionTimeline.js";

export function runAdoptionEngine(tenantId = "default", options = {}) {
  return Object.freeze({
    engineVersion: ADOPTION_ENGINE_VERSION,
    tenantId,
    storeInfo: getAdoptionEngineStoreInfo(),
    summary: summarizeAdoptionEngine(tenantId),
    context: assembleAdoptionContext(tenantId, options),
    bosProjection: buildAdoptionBosProjection(tenantId, options),
    adoptionRegistry: getAdoptionRegistry(tenantId),
    timeline: buildAdoptionTimeline(tenantId),
    consultingBridge: bridgeAdoptionToConsulting(tenantId),
    decisionBridge: bridgeAdoptionToDecision(tenantId),
    evolutionBridge: bridgeAdoptionToEvolution(tenantId),
    adoptionEngineReady: true,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    individualProfilingForbidden: true,
  });
}

export default runAdoptionEngine;

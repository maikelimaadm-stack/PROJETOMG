import { ENTERPRISE_EVOLUTION_ENGINE_VERSION } from "./evolutionEngineContracts.js";
import { getEvolutionEngineStoreInfo } from "./evolutionEngineStore.js";
import { summarizeEvolutionEngine } from "./evolutionSummarization.js";
import { assembleEvolutionContext } from "./evolutionContextAssembly.js";
import { buildEvolutionEngineBosProjection } from "./evolutionToBosProjection.js";
import {
  bridgeEvolutionToConsulting,
  bridgeEvolutionToDecision,
  bridgeEvolutionToIntent,
} from "./evolutionToIntelligenceBridges.js";
import { buildEvolutionSeedsRegistry } from "./evolutionSeedsRegistry.js";

export function runEvolutionEngine(tenantId = "default") {
  return Object.freeze({
    engineVersion: ENTERPRISE_EVOLUTION_ENGINE_VERSION,
    tenantId,
    storeInfo: getEvolutionEngineStoreInfo(),
    summary: summarizeEvolutionEngine(tenantId),
    context: assembleEvolutionContext(tenantId),
    bosProjection: buildEvolutionEngineBosProjection(tenantId),
    seeds: buildEvolutionSeedsRegistry(tenantId),
    consultingBridge: bridgeEvolutionToConsulting(tenantId),
    decisionBridge: bridgeEvolutionToDecision(tenantId),
    intentBridge: bridgeEvolutionToIntent(tenantId),
    evolutionEngineReady: true,
    autonomousExecutionForbidden: true,
  });
}

export default runEvolutionEngine;

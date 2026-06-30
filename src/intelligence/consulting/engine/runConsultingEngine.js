import { ENTERPRISE_CONSULTING_ENGINE_VERSION } from "./consultingEngineContracts.js";
import { getConsultingEngineStoreInfo } from "./consultingEngineStore.js";
import { summarizeConsultingEngine } from "./consultingSummarization.js";
import { assembleConsultingContext } from "./consultingContextAssembly.js";
import { buildConsultingEngineBosProjection } from "./consultingToBosProjection.js";
import {
  bridgeConsultingToDecision,
  bridgeConsultingToEvolution,
  bridgeConsultingToIntent,
} from "./consultingToIntelligenceBridges.js";
import { buildConsultingSeedsRegistry } from "./consultingSeedsRegistry.js";

export function runConsultingEngine(tenantId = "default") {
  return Object.freeze({
    engineVersion: ENTERPRISE_CONSULTING_ENGINE_VERSION,
    tenantId,
    storeInfo: getConsultingEngineStoreInfo(),
    summary: summarizeConsultingEngine(tenantId),
    context: assembleConsultingContext(tenantId),
    bosProjection: buildConsultingEngineBosProjection(tenantId),
    seeds: buildConsultingSeedsRegistry(tenantId),
    decisionBridge: bridgeConsultingToDecision(tenantId),
    evolutionBridge: bridgeConsultingToEvolution(tenantId),
    intentBridge: bridgeConsultingToIntent(tenantId),
    consultingEngineReady: true,
    autonomousExecutionForbidden: true,
  });
}

export default runConsultingEngine;

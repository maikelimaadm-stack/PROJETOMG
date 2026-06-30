import { ingestEventToMemoryEngine } from "./eventToMemoryPersistence.js";
import { assembleMemoryContext } from "./memoryContextAssembly.js";
import { retrieveMemoryRecords } from "./memoryRetrieval.js";
import { replayMemorySequence } from "./memoryReplay.js";
import { summarizeEnterpriseMemory } from "./memorySummarization.js";
import { buildMemoryEngineBosProjection } from "./memoryToBosProjection.js";
import { bridgeMemoryToIntelligence } from "./memoryToIntelligenceBridge.js";
import { getEnterpriseMemoryStoreInfo } from "./enterpriseMemoryStore.js";
import { ENTERPRISE_MEMORY_ENGINE_VERSION } from "./memoryEngineContracts.js";

/** Enterprise Memory Engine — orchestrator */
export function runMemoryEngine(tenantId = "default") {
  return Object.freeze({
    engineVersion: ENTERPRISE_MEMORY_ENGINE_VERSION,
    tenantId,
    storeInfo: getEnterpriseMemoryStoreInfo(),
    summary: summarizeEnterpriseMemory(tenantId),
    context: assembleMemoryContext(tenantId),
    bosProjection: buildMemoryEngineBosProjection(tenantId),
    intelligenceBridge: bridgeMemoryToIntelligence(tenantId),
  });
}

export {
  ingestEventToMemoryEngine,
  assembleMemoryContext,
  retrieveMemoryRecords,
  replayMemorySequence,
  summarizeEnterpriseMemory,
  buildMemoryEngineBosProjection,
  bridgeMemoryToIntelligence,
};

export default runMemoryEngine;

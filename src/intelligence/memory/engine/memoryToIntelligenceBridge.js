import { buildMemorySeedsRegistry } from "./memorySeedsRegistry.js";
import { assembleMemoryContext } from "./memoryContextAssembly.js";
import { replayMemorySequence } from "./memoryReplay.js";
import { summarizeEnterpriseMemory } from "./memorySummarization.js";

/** Memory-to-Intelligence bridge — feeds future engines without exposing tech to users */
export function bridgeMemoryToIntelligence(tenantId = "default") {
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    context: assembleMemoryContext(tenantId),
    summary: summarizeEnterpriseMemory(tenantId),
    seeds: buildMemorySeedsRegistry(tenantId),
    replay: replayMemorySequence(tenantId, { limit: 10 }),
    consultingReady: false,
    decisionEngineReady: false,
    knowledgeGraphReady: false,
    evolutionEngineReady: false,
  });
}

export default bridgeMemoryToIntelligence;

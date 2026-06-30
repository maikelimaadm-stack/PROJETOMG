import { ingestMemoryRecordToKnowledgeGraph, replayKnowledgeGraphFromMemory } from "./memoryToGraphIngestion.js";
import { summarizeKnowledgeGraph } from "./knowledgeSummarization.js";
import { retrieveKnowledgeByContext } from "./knowledgeRetrieval.js";
import { traverseKnowledgeGraph } from "./graphTraversal.js";
import { buildKnowledgeGraphBosProjection } from "./knowledgeToBosProjection.js";
import {
  bridgeKnowledgeToConsulting,
  bridgeKnowledgeToDecision,
  bridgeKnowledgeToEvolution,
} from "./knowledgeToIntelligenceBridges.js";
import { getKnowledgeGraphStoreInfo } from "./knowledgeGraphStore.js";
import { ENTERPRISE_KNOWLEDGE_GRAPH_VERSION } from "./knowledgeGraphContracts.js";

export function runKnowledgeGraphEngine(tenantId = "default") {
  return Object.freeze({
    engineVersion: ENTERPRISE_KNOWLEDGE_GRAPH_VERSION,
    tenantId,
    storeInfo: getKnowledgeGraphStoreInfo(),
    summary: summarizeKnowledgeGraph(tenantId),
    bosProjection: buildKnowledgeGraphBosProjection(tenantId),
    consultingBridge: bridgeKnowledgeToConsulting(tenantId),
    decisionBridge: bridgeKnowledgeToDecision(tenantId),
    evolutionBridge: bridgeKnowledgeToEvolution(tenantId),
  });
}

export {
  ingestMemoryRecordToKnowledgeGraph,
  replayKnowledgeGraphFromMemory,
  summarizeKnowledgeGraph,
  retrieveKnowledgeByContext,
  traverseKnowledgeGraph,
  buildKnowledgeGraphBosProjection,
  bridgeKnowledgeToConsulting,
  bridgeKnowledgeToDecision,
  bridgeKnowledgeToEvolution,
};

export default runKnowledgeGraphEngine;

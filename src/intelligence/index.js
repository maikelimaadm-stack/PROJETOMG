export {
  ENTERPRISE_INTELLIGENCE_VERSION,
  DOMAIN_EVENT_BUS_VERSION,
  BUSINESS_MEMORY_FOUNDATION_VERSION,
  BUSINESS_EVENT_ENVELOPE_VERSION,
  INTELLIGENCE_OWNERSHIP,
  BUSINESS_EVENT_CATEGORIES,
  BUSINESS_EVENT_TYPES,
  MEMORY_RECORD_TYPES,
  INTELLIGENCE_EXTENSION_POINTS,
} from "./contracts/intelligenceContracts.js";

export { createBusinessEventEnvelope } from "./bus/businessEventEnvelope.js";
export {
  publishDomainEvent,
  listDomainEvents,
  subscribeDomainEvents,
  countDomainEventsByType,
  getDomainEventBusInfo,
} from "./bus/domainEventBus.js";

export {
  persistBusinessMemoryRecord,
  listBusinessMemoryRecords,
  getBusinessMemoryFoundationInfo,
} from "./memory/businessMemoryStore.js";
export { buildEventLineage } from "./memory/lineageStorage.js";
export { buildTenantKnowledgeSeeds } from "./memory/knowledgeSeeds.js";

export { captureEnterpriseContext } from "./capture/enterpriseContextCapture.js";
export { captureWorkflowOutcome, captureWorkflowTaskCreated } from "./capture/workflowOutcomeCapture.js";
export { captureIntentOutcome, captureIntentResolved } from "./capture/intentOutcomeCapture.js";
export { captureHumanDecision } from "./capture/decisionCapture.js";
export { captureBusinessOutcome, captureUserConfirmation } from "./capture/outcomeCapture.js";

export { registerObservation, listObservations, getObservationRegistryInfo } from "./observation/observationRegistry.js";
export { processObservationLayer } from "./observation/observationLayer.js";
export { detectPatternsFromEvents } from "./observation/patternCapture.js";

export { buildBusinessEventTimeline, formatTimelineForBos } from "./timeline/businessEventTimeline.js";

export { deriveHealthSignals, computeHealthScore } from "./signals/businessHealthSignals.js";
export { createExplainableIntelligenceRecord } from "./signals/explainableIntelligenceRecord.js";

export { registerImprovementOpportunity, listImprovementOpportunities } from "./registry/improvementOpportunityRegistry.js";
export { emitConsultingSignal, listConsultingSignals } from "./registry/consultingSignals.js";
export { recordEvolutionTelemetry, listEvolutionTelemetry } from "./registry/evolutionTelemetry.js";

export {
  INTELLIGENCE_SECURITY_CONTRACTS,
  validateIntelligenceSecurity,
} from "./security/intelligenceSecurityContracts.js";

export {
  captureBosHomeViewed,
  bridgeWorkflowTaskAction,
  bridgeWorkflowTaskCreated,
  bridgeIntentResolverResult,
  bridgeUserConfirmation,
} from "./integration/intelligenceEventBridge.js";
export { buildIntelligenceHomeProjection } from "./integration/bosIntelligenceProjection.js";

export {
  ENTERPRISE_MEMORY_ENGINE_VERSION,
  MEMORY_STORE_TYPES,
  MEMORY_ENGINE_EXTENSION_POINTS,
} from "./memory/engine/memoryEngineContracts.js";
export {
  persistEnterpriseMemoryRecord,
  listEnterpriseMemoryRecords,
  getEnterpriseMemoryStoreInfo,
} from "./memory/engine/enterpriseMemoryStore.js";
export { ingestEventToMemoryEngine } from "./memory/engine/eventToMemoryPersistence.js";
export { retrieveMemoryRecords, retrieveLatestDecisions, retrieveLatestWorkflows } from "./memory/engine/memoryRetrieval.js";
export { replayMemorySequence, buildReplaySummary } from "./memory/engine/memoryReplay.js";
export { assembleMemoryContext } from "./memory/engine/memoryContextAssembly.js";
export { summarizeEnterpriseMemory } from "./memory/engine/memorySummarization.js";
export { buildMemoryTimeline, buildMemoryTimelineForBos } from "./memory/engine/memoryTimeline.js";
export { buildMemoryEngineBosProjection } from "./memory/engine/memoryToBosProjection.js";
export { bridgeMemoryToIntelligence } from "./memory/engine/memoryToIntelligenceBridge.js";
export { buildMemorySeedsRegistry } from "./memory/engine/memorySeedsRegistry.js";
export { runMemoryEngine } from "./memory/engine/runMemoryEngine.js";

export {
  ENTERPRISE_KNOWLEDGE_GRAPH_VERSION,
  KNOWLEDGE_NODE_KINDS,
  KNOWLEDGE_RELATIONSHIP_KINDS,
  KNOWLEDGE_GRAPH_EXTENSION_POINTS,
} from "./knowledge/graph/knowledgeGraphContracts.js";
export {
  listKnowledgeNodes,
  listKnowledgeEdges,
  getKnowledgeGraphStoreInfo,
} from "./knowledge/graph/knowledgeGraphStore.js";
export { ingestMemoryRecordToKnowledgeGraph, replayKnowledgeGraphFromMemory } from "./knowledge/graph/memoryToGraphIngestion.js";
export { retrieveKnowledgeByContext } from "./knowledge/graph/knowledgeRetrieval.js";
export { traverseKnowledgeGraph, findRelatedNodes } from "./knowledge/graph/graphTraversal.js";
export { summarizeKnowledgeGraph } from "./knowledge/graph/knowledgeSummarization.js";
export { buildKnowledgeGraphBosProjection } from "./knowledge/graph/knowledgeToBosProjection.js";
export {
  bridgeKnowledgeToConsulting,
  bridgeKnowledgeToDecision,
  bridgeKnowledgeToEvolution,
} from "./knowledge/graph/knowledgeToIntelligenceBridges.js";
export { buildKnowledgeSeedsRegistry } from "./knowledge/graph/knowledgeSeedsRegistry.js";
export { runKnowledgeGraphEngine } from "./knowledge/graph/runKnowledgeGraphEngine.js";

export {
  ENTERPRISE_CONSULTING_ENGINE_VERSION,
  CONSULTING_DOCUMENT_TYPES,
  CONSULTING_SIGNAL_TYPES,
  CONSULTING_ENGINE_EXTENSION_POINTS,
} from "./consulting/engine/consultingEngineContracts.js";
export {
  listConsultingDocuments,
  listConsultingRecommendations,
  listImprovementPlans,
  getConsultingEngineStoreInfo,
} from "./consulting/engine/consultingEngineStore.js";
export { assembleConsultingContext } from "./consulting/engine/consultingContextAssembly.js";
export {
  analyzeConsultingContext,
  ingestKnowledgeGraphToConsulting,
  replayConsultingFromMemoryAndGraph,
} from "./consulting/engine/graphToConsultingIngestion.js";
export { retrieveConsultingByContext } from "./consulting/engine/consultingRetrieval.js";
export { summarizeConsultingEngine } from "./consulting/engine/consultingSummarization.js";
export { buildConsultingEngineBosProjection } from "./consulting/engine/consultingToBosProjection.js";
export {
  bridgeConsultingToDecision,
  bridgeConsultingToEvolution,
  bridgeConsultingToIntent,
} from "./consulting/engine/consultingToIntelligenceBridges.js";
export { buildConsultingSeedsRegistry } from "./consulting/engine/consultingSeedsRegistry.js";
export { runConsultingEngine } from "./consulting/engine/runConsultingEngine.js";

export default {
  version: "mak-enterprise-intelligence-v1",
};

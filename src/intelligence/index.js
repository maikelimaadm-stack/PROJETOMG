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

export default {
  version: "mak-enterprise-intelligence-v1",
};

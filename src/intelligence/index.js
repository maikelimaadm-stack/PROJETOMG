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

export {
  ENTERPRISE_DECISION_ENGINE_VERSION,
  DECISION_DOCUMENT_TYPES,
  DECISION_OPTION_TYPES,
  DECISION_ENGINE_EXTENSION_POINTS,
} from "./decision/engine/decisionEngineContracts.js";
export {
  listDecisionDocuments,
  listDecisionOptions,
  listDecisionScenarios,
  getDecisionEngineStoreInfo,
} from "./decision/engine/decisionEngineStore.js";
export { assembleDecisionContext } from "./decision/engine/decisionContextAssembly.js";
export {
  analyzeDecisionContext,
  ingestConsultingToDecision,
  replayDecisionFromStack,
} from "./decision/engine/consultingToDecisionIngestion.js";
export { retrieveDecisionsByContext } from "./decision/engine/decisionRetrieval.js";
export { summarizeDecisionEngine } from "./decision/engine/decisionSummarization.js";
export { buildDecisionEngineBosProjection } from "./decision/engine/decisionToBosProjection.js";
export {
  bridgeDecisionToEvolution,
  bridgeDecisionToIntent,
} from "./decision/engine/decisionToIntelligenceBridges.js";
export {
  approveDecision,
  rejectDecision,
  deferDecision,
} from "./decision/engine/decisionApprovalWorkflow.js";
export { buildDecisionSeedsRegistry } from "./decision/engine/decisionSeedsRegistry.js";
export { runDecisionEngine } from "./decision/engine/runDecisionEngine.js";

export {
  ENTERPRISE_EVOLUTION_ENGINE_VERSION,
  EVOLUTION_DOCUMENT_TYPES,
  EVOLUTION_SIGNAL_TYPES,
  EVOLUTION_ENGINE_EXTENSION_POINTS,
} from "./evolution/engine/evolutionEngineContracts.js";
export {
  listEvolutionDocuments,
  listEvolutionPlans,
  listEvolutionRoadmaps,
  getEvolutionEngineStoreInfo,
} from "./evolution/engine/evolutionEngineStore.js";
export { assembleEvolutionContext } from "./evolution/engine/evolutionContextAssembly.js";
export { buildEvolutionTimeline } from "./evolution/engine/evolutionTimeline.js";
export {
  analyzeEvolutionContext,
  ingestDecisionToEvolution,
  replayEvolutionFromStack,
} from "./evolution/engine/decisionToEvolutionIngestion.js";
export { retrieveEvolutionByContext } from "./evolution/engine/evolutionRetrieval.js";
export { summarizeEvolutionEngine } from "./evolution/engine/evolutionSummarization.js";
export { computeEvolutionMaturity } from "./evolution/engine/evolutionMaturityModel.js";
export { buildEvolutionEngineBosProjection } from "./evolution/engine/evolutionToBosProjection.js";
export {
  bridgeEvolutionToConsulting,
  bridgeEvolutionToDecision,
  bridgeEvolutionToDna,
  bridgeEvolutionToIntent,
} from "./evolution/engine/evolutionToIntelligenceBridges.js";
export { buildEvolutionSeedsRegistry } from "./evolution/engine/evolutionSeedsRegistry.js";
export { runEvolutionEngine } from "./evolution/engine/runEvolutionEngine.js";

export {
  BUSINESS_DNA_ENGINE_VERSION,
  BUSINESS_DNA_DOCUMENT_TYPES,
  DNA_PATTERN_TYPES,
  DNA_ENGINE_EXTENSION_POINTS,
} from "./dna/engine/businessDnaContracts.js";
export {
  listDnaProfiles,
  listDnaFingerprints,
  listDnaPatterns,
  listDnaMaturityRecords,
  getBusinessDnaStoreInfo,
  registerAuthorizedGroupScope,
  getAuthorizedGroupScope,
  isTenantAuthorizedInGroup,
} from "./dna/engine/businessDnaStore.js";
export { assembleBusinessDnaContext } from "./dna/engine/businessDnaContextAssembly.js";
export { computeDnaCapabilityMaturity } from "./dna/engine/businessDnaMaturityModel.js";
export {
  analyzeBusinessDnaContext,
  ingestEvolutionToBusinessDna,
  replayBusinessDnaFromStack,
} from "./dna/engine/evolutionToDnaIngestion.js";
export { retrieveBusinessDnaByContext, retrieveLatestBusinessDna } from "./dna/engine/businessDnaRetrieval.js";
export { summarizeBusinessDnaEngine } from "./dna/engine/businessDnaSummarization.js";
export { buildBusinessDnaBosProjection } from "./dna/engine/businessDnaToBosProjection.js";
export {
  bridgeDnaToConsulting,
  bridgeDnaToDecision,
  bridgeDnaToEvolution,
  bridgeDnaToSegmentation,
} from "./dna/engine/businessDnaToIntelligenceBridges.js";
export { buildBusinessDnaSeedsRegistry } from "./dna/engine/businessDnaSeedsRegistry.js";
export { buildPortfolioView } from "./dna/engine/portfolioView.js";
export { aggregateGroupMaturity, resolveAuthorizedGroupScope } from "./dna/engine/groupMaturityAggregation.js";
export { buildCorporateBenchmarking, buildCrossCompanyComparison } from "./dna/engine/corporateBenchmarking.js";
export { runBusinessDnaEngine } from "./dna/engine/runBusinessDnaEngine.js";

export {
  SEGMENTATION_ENGINE_VERSION,
  OPERATIONAL_SEGMENTS,
  SEGMENTATION_ENGINE_EXTENSION_POINTS,
} from "./segmentation/engine/segmentationEngineContracts.js";
export {
  listSegmentationProfiles,
  listSegmentationClassifications,
  listTemplateMatches,
  getSegmentationEngineStoreInfo,
} from "./segmentation/engine/segmentationEngineStore.js";
export { assembleSegmentationContext } from "./segmentation/engine/segmentationContextAssembly.js";
export {
  analyzeSegmentationContext,
  ingestDnaToSegmentation,
  replaySegmentationFromStack,
} from "./segmentation/engine/dnaToSegmentationIngestion.js";
export { retrieveSegmentationByContext, retrieveLatestSegmentation } from "./segmentation/engine/segmentationRetrieval.js";
export { summarizeSegmentationEngine } from "./segmentation/engine/segmentationSummarization.js";
export { buildSegmentationBosProjection } from "./segmentation/engine/segmentationToBosProjection.js";
export {
  bridgeSegmentationToConsulting,
  bridgeSegmentationToDecision,
  bridgeSegmentationToEvolution,
} from "./segmentation/engine/segmentationToIntelligenceBridges.js";
export { buildTemplateLibrary } from "./segmentation/engine/templateLibrary.js";
export { getTemplateCatalog } from "./segmentation/engine/templateCatalog.js";
export { computeAdvancedMaturityScore } from "./segmentation/engine/advancedMaturityScoring.js";
export { buildAdvancedMaturityRadar } from "./segmentation/engine/advancedMaturityRadar.js";
export { buildMaturityBenchmarks } from "./segmentation/engine/maturityBenchmarks.js";
export { compareMaturityProgress } from "./segmentation/engine/maturityProgressComparison.js";
export { buildAuthorizedGroupComparison } from "./segmentation/engine/authorizedGroupComparison.js";
export { buildCorporatePatternSuggestions } from "./segmentation/engine/corporatePatternSuggestions.js";
export { buildSegmentSeedsRegistry } from "./segmentation/engine/segmentSeedsRegistry.js";
export { runSegmentationEngine } from "./segmentation/engine/runSegmentationEngine.js";

export default {
  version: "mak-enterprise-intelligence-v1",
};

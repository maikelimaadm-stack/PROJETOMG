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
  findAuthorizedGroupIdForTenant,
  listAuthorizedGroupScopes,
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
  bridgeSegmentationToRecommendation,
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

export {
  RECOMMENDATION_ENGINE_VERSION,
  REPLICATION_ENGINE_VERSION,
  RECOMMENDATION_SIGNAL_TYPES,
  RECOMMENDATION_ENGINE_EXTENSION_POINTS,
} from "./recommendation/engine/recommendationEngineContracts.js";
export {
  listRecommendations,
  listRecommendationSignals,
  listReplications,
  getRecommendationEngineStoreInfo,
} from "./recommendation/engine/recommendationEngineStore.js";
export { assembleRecommendationContext } from "./recommendation/engine/recommendationContextAssembly.js";
export {
  analyzeRecommendationContext,
  ingestSegmentationToRecommendation,
  replayRecommendationFromStack,
} from "./recommendation/engine/segmentationToRecommendationIngestion.js";
export {
  retrieveRecommendationsByContext,
  retrieveReplicationsByContext,
  retrieveLatestRecommendations,
} from "./recommendation/engine/recommendationRetrieval.js";
export { summarizeRecommendationEngine } from "./recommendation/engine/recommendationSummarization.js";
export { summarizeReplicationEngine } from "./recommendation/engine/replicationSummarization.js";
export { buildRecommendationBosProjection } from "./recommendation/engine/recommendationToBosProjection.js";
export {
  bridgeRecommendationToConsulting,
  bridgeRecommendationToDecision,
  bridgeRecommendationToEvolution,
  bridgeRecommendationToAdoption,
} from "./recommendation/engine/recommendationToIntelligenceBridges.js";
export { buildReplicationSeedsRegistry } from "./recommendation/engine/replicationSeedsRegistry.js";
export { runRecommendationEngine } from "./recommendation/engine/runRecommendationEngine.js";

export {
  ADOPTION_ENGINE_VERSION,
  ADOPTION_STATUS_TYPES,
  ADOPTION_ENGINE_EXTENSION_POINTS,
} from "./adoption/engine/adoptionEngineContracts.js";
export {
  listAdoptions,
  listAdoptionPlans,
  listAdoptionMilestones,
  getAdoptionEngineStoreInfo,
} from "./adoption/engine/adoptionEngineStore.js";
export { assembleAdoptionContext } from "./adoption/engine/adoptionContextAssembly.js";
export {
  analyzeAdoptionContext,
  ingestRecommendationToAdoption,
  replayAdoptionFromStack,
} from "./adoption/engine/recommendationToAdoptionIngestion.js";
export {
  retrieveAdoptionsByContext,
  retrieveLatestAdoptions,
} from "./adoption/engine/adoptionRetrieval.js";
export { summarizeAdoptionEngine } from "./adoption/engine/adoptionSummarization.js";
export { buildAdoptionBosProjection } from "./adoption/engine/adoptionToBosProjection.js";
export {
  bridgeAdoptionToConsulting,
  bridgeAdoptionToDecision,
  bridgeAdoptionToEvolution,
} from "./adoption/engine/adoptionToIntelligenceBridges.js";
export { runAdoptionEngine } from "./adoption/engine/runAdoptionEngine.js";

export {
  CORPORATE_INTELLIGENCE_VERSION,
  CORPORATE_INTELLIGENCE_EXTENSION_POINTS,
} from "./corporate/engine/corporateIntelligenceContracts.js";
export {
  listCorporateViews,
  listCorporateBenchmarks,
  getCorporateIntelligenceStoreInfo,
} from "./corporate/engine/corporateIntelligenceStore.js";
export { assembleCorporateIntelligenceContext } from "./corporate/engine/corporateIntelligenceContextAssembly.js";
export {
  analyzeCorporateIntelligenceContext,
  ingestAdoptionToCorporateIntelligence,
} from "./corporate/engine/adoptionToCorporateIngestion.js";
export {
  retrieveCorporateIntelligenceByContext,
  retrieveLatestCorporateIntelligence,
} from "./corporate/engine/corporateIntelligenceRetrieval.js";
export { summarizeCorporateIntelligenceEngine } from "./corporate/engine/corporateIntelligenceSummarization.js";
export { buildCorporateIntelligenceBosProjection } from "./corporate/engine/corporateIntelligenceToBosProjection.js";
export { buildAuthorizedGroupInsights } from "./corporate/engine/authorizedGroupInsights.js";
export { buildGroupAdoptionComparison } from "./corporate/engine/groupAdoptionComparison.js";
export { trackReplicationAdoption } from "./corporate/engine/replicationAdoptionTracking.js";
export { trackRecommendationOutcomes } from "./corporate/engine/recommendationOutcomeTracking.js";
export { runCorporateIntelligenceEngine } from "./corporate/engine/runCorporateIntelligenceEngine.js";

export {
  IMPROVEMENT_ENGINE_VERSION,
  IMPROVEMENT_SIGNAL_TYPES,
  IMPROVEMENT_ENGINE_EXTENSION_POINTS,
} from "./improvement/engine/improvementEngineContracts.js";
export {
  listImprovementLoops,
  getImprovementEngineStoreInfo,
} from "./improvement/engine/improvementEngineStore.js";
export { assembleImprovementContext } from "./improvement/engine/improvementContextAssembly.js";
export {
  analyzeImprovementContext,
  ingestAdoptionToImprovement,
  replayImprovementFromStack,
} from "./improvement/engine/adoptionToImprovementIngestion.js";
export {
  retrieveImprovementsByContext,
  retrieveLatestImprovements,
} from "./improvement/engine/improvementRetrieval.js";
export { summarizeImprovementEngine } from "./improvement/engine/improvementSummarization.js";
export { buildImprovementBosProjection } from "./improvement/engine/improvementToBosProjection.js";
export {
  bridgeImprovementToRecommendation,
  bridgeImprovementToAdoption,
  bridgeImprovementToConsulting,
  bridgeImprovementToDecision,
  bridgeImprovementToEvolution,
} from "./improvement/engine/improvementToIntelligenceBridges.js";
export { buildImprovementSeedsRegistry } from "./improvement/engine/improvementSeedsRegistry.js";
export { trackImprovementProgress } from "./improvement/engine/improvementTracking.js";
export { runImprovementEngine } from "./improvement/engine/runImprovementEngine.js";

export {
  OPTIMIZATION_ENGINE_VERSION,
  OPTIMIZATION_SIGNAL_TYPES,
  OPTIMIZATION_ENGINE_EXTENSION_POINTS,
} from "./optimization/engine/optimizationEngineContracts.js";
export {
  listOptimizationLoops,
  listOptimizationOpportunities,
  getOptimizationEngineStoreInfo,
} from "./optimization/engine/optimizationEngineStore.js";
export { assembleOptimizationContext } from "./optimization/engine/optimizationContextAssembly.js";
export {
  analyzeOptimizationContext,
  ingestImprovementToOptimization,
} from "./optimization/engine/improvementToOptimizationIngestion.js";
export {
  retrieveOptimizationsByContext,
  retrieveLatestOptimizations,
} from "./optimization/engine/optimizationRetrieval.js";
export { summarizeOptimizationEngine } from "./optimization/engine/optimizationSummarization.js";
export { buildOptimizationBosProjection } from "./optimization/engine/optimizationToBosProjection.js";
export { buildOptimizationSeedsRegistry } from "./optimization/engine/optimizationSeedsRegistry.js";
export { trackOptimizationProgress } from "./optimization/engine/optimizationTracking.js";
export { runOptimizationEngine } from "./optimization/engine/runOptimizationEngine.js";
export { bridgeAdoptionToImprovement } from "./adoption/engine/adoptionToIntelligenceBridges.js";

export {
  PORTFOLIO_INTELLIGENCE_VERSION,
  PORTFOLIO_INTELLIGENCE_EXTENSION_POINTS,
} from "./portfolio/engine/portfolioIntelligenceContracts.js";
export {
  listPortfolioViews,
  listPortfolioDashboards,
  listPortfolioBenchmarks,
  getPortfolioIntelligenceStoreInfo,
} from "./portfolio/engine/portfolioIntelligenceStore.js";
export { assemblePortfolioContext } from "./portfolio/engine/portfolioContextAssembly.js";
export { authorizePortfolioScope } from "./portfolio/engine/portfolioScopeAuthorization.js";
export {
  analyzePortfolioIntelligenceContext,
  ingestOptimizationToPortfolio,
} from "./portfolio/engine/optimizationToPortfolioIngestion.js";
export {
  retrievePortfolioByContext,
  retrieveLatestPortfolioIntelligence,
} from "./portfolio/engine/portfolioRetrieval.js";
export { summarizePortfolioIntelligenceEngine } from "./portfolio/engine/portfolioSummarization.js";
export { buildPortfolioIntelligenceBosProjection } from "./portfolio/engine/portfolioToBosProjection.js";
export {
  bridgePortfolioToConsulting,
  bridgePortfolioToDecision,
  bridgePortfolioToEvolution,
} from "./portfolio/engine/portfolioToIntelligenceBridges.js";
export { runPortfolioIntelligenceEngine } from "./portfolio/engine/runPortfolioIntelligenceEngine.js";

export {
  PLATFORM_GOVERNANCE_VERSION,
  PLATFORM_GOVERNANCE_EXTENSION_POINTS,
} from "./governance/engine/platformGovernanceContracts.js";
export {
  listGovernanceDocuments,
  listGovernanceScopes,
  listGovernancePolicies,
  getPlatformGovernanceStoreInfo,
} from "./governance/engine/platformGovernanceStore.js";
export { assembleGovernanceContext } from "./governance/engine/governanceContextAssembly.js";
export {
  analyzePlatformGovernanceContext,
  ingestPortfolioToGovernance,
} from "./governance/engine/portfolioToGovernanceIngestion.js";
export {
  retrieveGovernanceByContext,
  retrieveLatestGovernance,
} from "./governance/engine/governanceRetrieval.js";
export { summarizePlatformGovernanceEngine } from "./governance/engine/governanceSummarization.js";
export { buildPlatformGovernanceBosProjection } from "./governance/engine/governanceToBosProjection.js";
export { bridgeGovernanceToPortfolio } from "./governance/engine/governanceToPortfolioBridge.js";
export {
  bridgeGovernanceToConsulting,
  bridgeGovernanceToDecision,
  bridgeGovernanceToPortfolioIntelligence,
} from "./governance/engine/governanceToIntelligenceBridges.js";
export { enforceCrossTenantAccessGuard } from "./governance/engine/crossTenantAccessGuard.js";
export { enforceDataExposureGuard } from "./governance/engine/dataExposureGuard.js";
export { runPlatformGovernanceEngine } from "./governance/engine/runPlatformGovernanceEngine.js";

export {
  COMPLIANCE_FORTRESS_VERSION,
  RETENTION_FORTRESS_VERSION,
  AUDIT_FORTRESS_VERSION,
  FORTRESS_EXTENSION_POINTS,
} from "./fortress/engine/complianceFortressContracts.js";
export {
  listComplianceDocs,
  listRetentionRules,
  listAuditEvents,
  getFortressStoreInfo,
} from "./fortress/engine/fortressStore.js";
export { assembleComplianceContext } from "./fortress/engine/complianceContextAssembly.js";
export {
  analyzeComplianceFortressContext,
  ingestGovernanceToFortress,
} from "./fortress/engine/governanceToFortressIngestion.js";
export { retrieveFortressByContext, retrieveLatestFortress } from "./fortress/engine/fortressRetrieval.js";
export { summarizeFortressEngine } from "./fortress/engine/fortressSummarization.js";
export { buildFortressBosProjection } from "./fortress/engine/fortressToBosProjection.js";
export { bridgeFortressToGovernance } from "./fortress/engine/fortressToGovernanceBridge.js";
export { bridgeFortressToPortfolio } from "./fortress/engine/fortressToPortfolioBridge.js";
export {
  bridgeFortressToConsulting,
  bridgeFortressToDecision,
  bridgeFortressToIntelligence,
} from "./fortress/engine/fortressToIntelligenceBridges.js";
export { runComplianceFortressEngine } from "./fortress/engine/runComplianceFortressEngine.js";

export {
  DATA_LIFECYCLE_VERSION,
  ARCHIVE_ENGINE_VERSION,
  EXPUNGE_ENGINE_VERSION,
  LEGAL_HOLD_ENGINE_VERSION,
  LIFECYCLE_EXTENSION_POINTS,
} from "./lifecycle/engine/dataLifecycleContracts.js";
export {
  listLifecycleDocs,
  listLifecycleRules,
  listLifecycleEvents,
  getLifecycleStoreInfo,
} from "./lifecycle/engine/lifecycleStore.js";
export { assembleLifecycleContext } from "./lifecycle/engine/lifecycleContextAssembly.js";
export {
  analyzeDataLifecycleContext,
  ingestFortressToLifecycle,
} from "./lifecycle/engine/fortressToLifecycleIngestion.js";
export { retrieveLifecycleByContext, retrieveLatestLifecycle } from "./lifecycle/engine/lifecycleRetrieval.js";
export { summarizeLifecycleEngine } from "./lifecycle/engine/lifecycleSummarization.js";
export { buildLifecycleBosProjection } from "./lifecycle/engine/lifecycleToBosProjection.js";
export { bridgeLifecycleToGovernance } from "./lifecycle/engine/lifecycleToGovernanceBridge.js";
export { bridgeLifecycleToFortress } from "./lifecycle/engine/lifecycleToFortressBridge.js";
export { bridgeLifecycleToPortfolio } from "./lifecycle/engine/lifecycleToPortfolioBridge.js";
export {
  bridgeLifecycleToConsulting,
  bridgeLifecycleToDecision,
  bridgeLifecycleToIntelligence,
} from "./lifecycle/engine/lifecycleToIntelligenceBridges.js";
export { runDataLifecycleEngine } from "./lifecycle/engine/runDataLifecycleEngine.js";
export {
  requestArchiveExecution,
  executeArchiveWithApproval,
} from "./lifecycle/engine/archiveEngine.js";
export {
  requestExpungeExecution,
  executeExpungeWithApproval,
} from "./lifecycle/engine/expungeEngine.js";
export { applyLegalHold, releaseLegalHold } from "./lifecycle/engine/legalHoldEngine.js";

export {
  LIFECYCLE_PERSISTENCE_VERSION,
  APPROVAL_WORKFLOW_VERSION,
  LIFECYCLE_EXECUTION_QUEUE_VERSION,
  LIFECYCLE_PERSISTENCE_EXTENSION_POINTS,
} from "./lifecycle/persistence/lifecyclePersistenceContracts.js";
export { getDurableStoreInfo } from "./lifecycle/persistence/durableLifecycleStore.js";
export {
  analyzeLifecyclePersistenceContext,
  ingestLifecycleToPersistence,
} from "./lifecycle/persistence/lifecycleToPersistenceIngestion.js";
export { retrievePersistentLifecycle } from "./lifecycle/persistence/lifecyclePersistenceRetrieval.js";
export { summarizeLifecyclePersistence } from "./lifecycle/persistence/lifecyclePersistenceSummaries.js";
export { buildLifecyclePersistenceBosProjection } from "./lifecycle/persistence/lifecyclePersistenceToBosProjection.js";
export {
  approveLifecycleRequest,
  rejectLifecycleRequest,
  createApprovalRequest,
} from "./lifecycle/persistence/approvalWorkflowEngine.js";
export { processExecutionQueue } from "./lifecycle/persistence/lifecycleExecutionQueue.js";
export { assembleLifecycleExecutionContext } from "./lifecycle/persistence/lifecycleExecutionContextAssembly.js";
export { runLifecyclePersistenceEngine } from "./lifecycle/persistence/runLifecyclePersistenceEngine.js";
export { bridgePersistenceToGovernance } from "./lifecycle/persistence/lifecyclePersistenceToGovernanceBridge.js";
export { bridgePersistenceToFortress } from "./lifecycle/persistence/lifecyclePersistenceToFortressBridge.js";
export { bridgePersistenceToPortfolio } from "./lifecycle/persistence/lifecyclePersistenceToPortfolioBridge.js";
export {
  bridgePersistenceToConsulting,
  bridgePersistenceToDecision,
  bridgePersistenceToIntelligence,
} from "./lifecycle/persistence/lifecyclePersistenceToIntelligenceBridges.js";

export default {
  version: "mak-enterprise-intelligence-v1",
};

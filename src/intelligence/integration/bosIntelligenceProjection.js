import { buildMemoryEngineBosProjection } from "../memory/engine/memoryToBosProjection.js";
import { bridgeMemoryToIntelligence } from "../memory/engine/memoryToIntelligenceBridge.js";
import { buildKnowledgeGraphBosProjection } from "../knowledge/graph/knowledgeToBosProjection.js";
import { buildConsultingEngineBosProjection } from "../consulting/engine/consultingToBosProjection.js";
import { buildDecisionEngineBosProjection } from "../decision/engine/decisionToBosProjection.js";
import { buildEvolutionEngineBosProjection } from "../evolution/engine/evolutionToBosProjection.js";
import { buildBusinessDnaBosProjection } from "../dna/engine/businessDnaToBosProjection.js";
import { buildPortfolioView } from "../dna/engine/portfolioView.js";
import { buildSegmentationBosProjection } from "../segmentation/engine/segmentationToBosProjection.js";
import { buildRecommendationBosProjection } from "../recommendation/engine/recommendationToBosProjection.js";
import { buildAdoptionBosProjection } from "../adoption/engine/adoptionToBosProjection.js";
import { buildCorporateIntelligenceBosProjection } from "../corporate/engine/corporateIntelligenceToBosProjection.js";
import { buildImprovementBosProjection } from "../improvement/engine/improvementToBosProjection.js";
import { buildOptimizationBosProjection } from "../optimization/engine/optimizationToBosProjection.js";
import { buildPortfolioIntelligenceBosProjection } from "../portfolio/engine/portfolioToBosProjection.js";
import { buildPlatformGovernanceBosProjection } from "../governance/engine/governanceToBosProjection.js";
import { buildFortressBosProjection } from "../fortress/engine/fortressToBosProjection.js";
import { buildLifecycleBosProjection } from "../lifecycle/engine/lifecycleToBosProjection.js";
import { buildLifecyclePersistenceBosProjection } from "../lifecycle/persistence/lifecyclePersistenceToBosProjection.js";
import { buildAuthorizedGroupComparison } from "../segmentation/engine/authorizedGroupComparison.js";
import { buildCorporatePatternSuggestions } from "../segmentation/engine/corporatePatternSuggestions.js";
import {
  bridgeSegmentationToConsulting,
  bridgeSegmentationToDecision,
  bridgeSegmentationToEvolution,
  bridgeSegmentationToRecommendation,
} from "../segmentation/engine/segmentationToIntelligenceBridges.js";
import {
  bridgeRecommendationToConsulting,
  bridgeRecommendationToDecision,
  bridgeRecommendationToEvolution,
  bridgeRecommendationToAdoption,
} from "../recommendation/engine/recommendationToIntelligenceBridges.js";
import {
  bridgeAdoptionToConsulting,
  bridgeAdoptionToDecision,
  bridgeAdoptionToEvolution,
  bridgeAdoptionToImprovement,
} from "../adoption/engine/adoptionToIntelligenceBridges.js";
import {
  bridgeImprovementToConsulting,
  bridgeImprovementToDecision,
  bridgeImprovementToEvolution,
  bridgeImprovementToRecommendation,
  bridgeImprovementToAdoption,
} from "../improvement/engine/improvementToIntelligenceBridges.js";
import {
  bridgePortfolioToConsulting,
  bridgePortfolioToDecision,
  bridgePortfolioToEvolution,
} from "../portfolio/engine/portfolioToIntelligenceBridges.js";
import {
  bridgeGovernanceToConsulting,
  bridgeGovernanceToDecision,
  bridgeGovernanceToPortfolioIntelligence,
} from "../governance/engine/governanceToIntelligenceBridges.js";
import {
  bridgeFortressToConsulting,
  bridgeFortressToDecision,
  bridgeFortressToIntelligence,
} from "../fortress/engine/fortressToIntelligenceBridges.js";
import { bridgeFortressToGovernance } from "../fortress/engine/fortressToGovernanceBridge.js";
import { bridgeFortressToPortfolio } from "../fortress/engine/fortressToPortfolioBridge.js";
import {
  bridgeLifecycleToConsulting,
  bridgeLifecycleToDecision,
  bridgeLifecycleToIntelligence,
} from "../lifecycle/engine/lifecycleToIntelligenceBridges.js";
import { bridgeLifecycleToGovernance } from "../lifecycle/engine/lifecycleToGovernanceBridge.js";
import { bridgeLifecycleToFortress } from "../lifecycle/engine/lifecycleToFortressBridge.js";
import { bridgeLifecycleToPortfolio } from "../lifecycle/engine/lifecycleToPortfolioBridge.js";
import {
  bridgePersistenceToConsulting,
  bridgePersistenceToDecision,
  bridgePersistenceToIntelligence,
} from "../lifecycle/persistence/lifecyclePersistenceToIntelligenceBridges.js";
import { bridgePersistenceToGovernance } from "../lifecycle/persistence/lifecyclePersistenceToGovernanceBridge.js";
import { bridgePersistenceToFortress } from "../lifecycle/persistence/lifecyclePersistenceToFortressBridge.js";
import { bridgePersistenceToPortfolio } from "../lifecycle/persistence/lifecyclePersistenceToPortfolioBridge.js";
import {
  bridgeDnaToConsulting,
  bridgeDnaToDecision,
  bridgeDnaToEvolution,
  bridgeDnaToSegmentation,
} from "../dna/engine/businessDnaToIntelligenceBridges.js";
import {
  bridgeEvolutionToConsulting,
  bridgeEvolutionToDecision,
  bridgeEvolutionToDna,
  bridgeEvolutionToIntent,
} from "../evolution/engine/evolutionToIntelligenceBridges.js";
import {
  bridgeConsultingToDecision,
  bridgeConsultingToEvolution,
  bridgeConsultingToIntent,
} from "../consulting/engine/consultingToIntelligenceBridges.js";
import {
  bridgeDecisionToEvolution,
  bridgeDecisionToIntent,
} from "../decision/engine/decisionToIntelligenceBridges.js";
import { bridgeKnowledgeToConsulting, bridgeKnowledgeToDecision, bridgeKnowledgeToEvolution } from "../knowledge/graph/knowledgeToIntelligenceBridges.js";
import { processObservationLayer } from "../observation/observationLayer.js";
import { listImprovementOpportunities } from "../registry/improvementOpportunityRegistry.js";

/** BOS-facing projection — full intelligence stack including Business DNA */
export function buildIntelligenceHomeProjection(tenantId = "default", options = {}) {
  const memoryProjection = buildMemoryEngineBosProjection(tenantId);
  const knowledgeProjection = buildKnowledgeGraphBosProjection(tenantId);
  const consultingProjection = buildConsultingEngineBosProjection(tenantId);
  const decisionProjection = buildDecisionEngineBosProjection(tenantId);
  const evolutionProjection = buildEvolutionEngineBosProjection(tenantId);
  const dnaProjection = buildBusinessDnaBosProjection(tenantId);
  const segmentationProjection = buildSegmentationBosProjection(tenantId, options);
  const recommendationProjection = buildRecommendationBosProjection(tenantId, options);
  const adoptionProjection = buildAdoptionBosProjection(tenantId, options);
  const corporateProjection = options.groupId
    ? buildCorporateIntelligenceBosProjection(options.groupId, tenantId, options)
    : null;
  const improvementProjection = buildImprovementBosProjection(tenantId, options);
  const optimizationProjection = buildOptimizationBosProjection(tenantId, options);
  const portfolioIntelligenceProjection = options.groupId
    ? buildPortfolioIntelligenceBosProjection(options.groupId, tenantId, options)
    : null;
  const platformGovernanceProjection = options.groupId
    ? buildPlatformGovernanceBosProjection(options.groupId, tenantId, options)
    : null;
  const fortressProjection = options.groupId
    ? buildFortressBosProjection(options.groupId, tenantId, options)
    : null;
  const lifecycleProjection = options.groupId
    ? buildLifecycleBosProjection(options.groupId, tenantId, options)
    : null;
  const lifecyclePersistenceProjection = options.groupId
    ? buildLifecyclePersistenceBosProjection(options.groupId, tenantId, options)
    : null;
  const portfolioProjection = options.groupId
    ? buildPortfolioView(options.groupId, tenantId)
    : null;
  const observation = processObservationLayer(tenantId);
  const improvements = listImprovementOpportunities(tenantId);

  const base = memoryProjection.hasMemory
    ? {
        ...memoryProjection,
        hasObservations: true,
        improvementCount: improvements.length,
        intelligenceBridge: bridgeMemoryToIntelligence(tenantId),
        patterns: observation.patterns,
      }
    : {
        health: memoryProjection.health,
        activity: memoryProjection.activity,
        hasObservations: false,
        hasMemory: false,
        improvementCount: improvements.length,
        operationalSummary: memoryProjection.operationalSummary,
        recentDecisions: [],
        recentWorkflows: [],
        whyHighlights: [],
        replayTeaser: memoryProjection.replayTeaser,
        evolutionSignal: memoryProjection.evolutionSignal,
        patterns: observation.patterns,
      };

  return Object.freeze({
    ...base,
    hasKnowledge: knowledgeProjection.hasGraph,
    knowledgeSummary: knowledgeProjection.summary,
    knowledgeRelations: knowledgeProjection.assetRelations,
    decisionOutcomeLinks: knowledgeProjection.decisionOutcomeLinks,
    contextShortcuts: knowledgeProjection.contextShortcuts,
    whyRelated: knowledgeProjection.whyRelated,
    recurringPatterns: knowledgeProjection.recurringPatterns,
    hasConsulting: consultingProjection.hasConsulting,
    consultingSummary: consultingProjection.summary,
    consultingOpportunities: consultingProjection.opportunities,
    consultingRecommendations: consultingProjection.recommendations,
    consultingPlans: consultingProjection.improvementPlans,
    consultingPriorities: consultingProjection.suggestedPriorities,
    consultingEvidence: consultingProjection.evidenceHighlights,
    consultingEvolutionTracking: consultingProjection.evolutionTracking,
    hasDecisions: decisionProjection.hasDecisions,
    decisionSummary: decisionProjection.summary,
    decisionPending: decisionProjection.pendingDecisions,
    decisionAlternatives: decisionProjection.alternatives,
    decisionScenarios: decisionProjection.scenarios,
    decisionEvidence: decisionProjection.evidenceHighlights,
    decisionHistory: decisionProjection.decisionHistory,
    decisionWhyImportant: decisionProjection.whyImportant,
    decisionNextAction: decisionProjection.nextAction,
    hasEvolution: evolutionProjection.hasEvolution,
    evolutionSummary: evolutionProjection.summary,
    evolutionTimeline: evolutionProjection.evolutionTimeline,
    evolutionMaturity: evolutionProjection.maturityLevel,
    evolutionMaturityByCapability: evolutionProjection.maturityByCapability,
    evolutionPlans: evolutionProjection.evolutionPlans,
    evolutionMilestones: evolutionProjection.milestones,
    evolutionSuggestedPaths: evolutionProjection.suggestedPaths,
    evolutionProgressSummary: evolutionProjection.progressSummary,
    evolutionNextSteps: evolutionProjection.nextSteps,
    evolutionWhyRecommended: evolutionProjection.whyRecommended,
    evolutionPeriodComparison: evolutionProjection.periodComparison,
    evolutionDecisionImpact: evolutionProjection.accumulatedDecisionImpact,
    hasDna: dnaProjection.hasDna,
    dnaSummary: dnaProjection.summary,
    dnaIdentityHeadline: dnaProjection.identityHeadline,
    dnaIdentityNarrative: dnaProjection.identityNarrative,
    dnaWhoIsThisCompany: dnaProjection.whoIsThisCompany,
    dnaHowThisCompanyWorks: dnaProjection.howThisCompanyWorks,
    dnaMaturityLevel: dnaProjection.maturityLevel,
    dnaMaturityByCapability: dnaProjection.maturityByCapability,
    dnaCapabilityRadar: dnaProjection.capabilityRadar,
    dnaOperationalPatterns: dnaProjection.operationalPatterns,
    dnaCulturalPatterns: dnaProjection.culturalPatterns,
    dnaMilestones: dnaProjection.milestones,
    dnaGrowthSignals: dnaProjection.growthSignals,
    dnaFingerprintTraits: dnaProjection.fingerprintTraits,
    dnaFingerprintLabel: dnaProjection.fingerprintLabel,
    dnaWhereMatured: dnaProjection.whereMatured,
    dnaWhereNeedsEvolution: dnaProjection.whereNeedsEvolution,
    dnaMaturityTimeline: dnaProjection.maturityTimeline,
    dnaPortfolio: portfolioProjection,
    hasSegmentation: segmentationProjection.hasSegmentation,
    segmentationSummary: segmentationProjection.summary,
    segmentLabel: segmentationProjection.segmentLabel,
    segmentNarrative: segmentationProjection.segmentNarrative,
    compatibleTemplates: segmentationProjection.compatibleTemplates,
    segmentationMaturityRadar: segmentationProjection.maturityRadar,
    advancedMaturityScore: segmentationProjection.advancedMaturityScore,
    segmentationPriorityCapabilities: segmentationProjection.priorityCapabilities,
    maturityProgress: segmentationProjection.maturityProgress,
    segmentationBenchmarks: segmentationProjection.benchmarks,
    accelerationSuggestions: segmentationProjection.accelerationSuggestions,
    segmentationGroupComparison: options.groupId
      ? buildAuthorizedGroupComparison(options.groupId, tenantId)
      : segmentationProjection.groupComparison,
    corporatePatternSuggestions: options.groupId
      ? buildCorporatePatternSuggestions(options.groupId, tenantId)
      : segmentationProjection.patternSuggestions,
    templateHeadline: segmentationProjection.templateHeadline,
    hasRecommendations: recommendationProjection.hasRecommendations,
    recommendationSummary: recommendationProjection.summary,
    priorityRecommendations: recommendationProjection.priorityRecommendations,
    suggestedImprovementPlans: recommendationProjection.suggestedPlans,
    replicablePractices: recommendationProjection.replicablePractices,
    replicationSummary: recommendationProjection.replicationSummary,
    recommendationNextSteps: recommendationProjection.nextSteps,
    recommendationWhy: recommendationProjection.whyRecommended,
    hasAdoptions: adoptionProjection.hasAdoptions,
    adoptionSummary: adoptionProjection.summary,
    adoptedRecommendations: adoptionProjection.adoptedRecommendations,
    rejectedRecommendations: adoptionProjection.rejectedRecommendations,
    adoptionPlansInProgress: adoptionProjection.plansInProgress,
    adoptionMilestones: adoptionProjection.milestones,
    replicatedPracticesAdopted: adoptionProjection.replicatedPractices,
    adoptionValidatedOutcomes: adoptionProjection.validatedOutcomes,
    adoptionPendingValidation: adoptionProjection.pendingValidation,
    adoptionTimeline: adoptionProjection.adoptionTimeline,
    adoptionProgressPercent: adoptionProjection.overallProgressPercent,
    hasCorporateIntelligence: corporateProjection?.hasCorporateIntelligence ?? false,
    corporateSummary: corporateProjection?.summary ?? null,
    corporateView: corporateProjection?.corporateView ?? null,
    corporateBenchmarks: corporateProjection?.benchmarks ?? [],
    corporateReferences: corporateProjection?.references ?? [],
    corporateVariances: corporateProjection?.variances ?? [],
    corporateOpportunities: corporateProjection?.opportunities ?? [],
    corporateCompanyComparisons: corporateProjection?.companyComparisons ?? [],
    corporateGroupInsights: corporateProjection?.groupInsights ?? [],
    corporateHealthScore: corporateProjection?.healthScore ?? null,
    hasImprovement: improvementProjection.hasImprovement,
    improvementSummary: improvementProjection.summary,
    activeImprovementCycles: improvementProjection.activeImprovementCycles,
    improvementOpportunities: improvementProjection.improvementOpportunities,
    validatedImprovements: improvementProjection.validatedImprovements,
    pendingEffectImprovements: improvementProjection.pendingEffectImprovements,
    recurringImprovementPatterns: improvementProjection.recurringImprovementPatterns,
    improvementBenchmarks: improvementProjection.improvementBenchmarks,
    accumulatedImprovementImpact: improvementProjection.accumulatedImpact,
    improvementNextSteps: improvementProjection.improvementNextSteps,
    hasOptimization: optimizationProjection.hasOptimization,
    optimizationSummary: optimizationProjection.summary,
    activeOptimizationLoops: optimizationProjection.activeOptimizationLoops,
    optimizationOpportunities: optimizationProjection.optimizationOpportunities,
    optimizationBenchmarks: optimizationProjection.optimizationBenchmarks,
    operationalFeedbackLoop: optimizationProjection.operationalFeedbackLoop,
    hasPortfolioIntelligence: portfolioIntelligenceProjection?.hasPortfolioIntelligence ?? false,
    portfolioSummary: portfolioIntelligenceProjection?.summary ?? null,
    portfolioCommandCenter: portfolioIntelligenceProjection?.commandCenter ?? null,
    portfolioCompanyHealth: portfolioIntelligenceProjection?.companyHealth ?? [],
    portfolioRankings: portfolioIntelligenceProjection?.portfolioRankings ?? [],
    portfolioReferences: portfolioIntelligenceProjection?.portfolioReferences ?? [],
    portfolioVariances: portfolioIntelligenceProjection?.portfolioVariances ?? [],
    portfolioOpportunities: portfolioIntelligenceProjection?.portfolioOpportunities ?? [],
    portfolioAlerts: portfolioIntelligenceProjection?.portfolioAlerts ?? [],
    portfolioBenchmarks: portfolioIntelligenceProjection?.portfolioBenchmarks ?? [],
    portfolioTrends: portfolioIntelligenceProjection?.portfolioTrends ?? [],
    corporateStandardization: portfolioIntelligenceProjection?.corporateStandardization ?? [],
    groupCapabilityRadar: portfolioIntelligenceProjection?.groupCapabilityRadar ?? null,
    groupEvolutionTimeline: portfolioIntelligenceProjection?.groupEvolutionTimeline ?? [],
    portfolioLeaderCompany: portfolioIntelligenceProjection?.leaderCompany ?? null,
    portfolioAboveStandardCount: portfolioIntelligenceProjection?.aboveStandardCount ?? null,
    portfolioBelowStandardCount: portfolioIntelligenceProjection?.belowStandardCount ?? null,
    hasPlatformGovernance: platformGovernanceProjection?.hasPlatformGovernance ?? false,
    governanceSummary: platformGovernanceProjection?.summary ?? null,
    governanceControlCenter: platformGovernanceProjection?.governanceControlCenter ?? null,
    portfolioControlCenter: platformGovernanceProjection?.portfolioControlCenter ?? null,
    authorizedGroupScopes: platformGovernanceProjection?.authorizedGroupScopes ?? [],
    activePolicies: platformGovernanceProjection?.activePolicies ?? [],
    governancePermissions: platformGovernanceProjection?.governancePermissions ?? [],
    retentionPolicies: platformGovernanceProjection?.retentionPolicies ?? [],
    complianceStatus: platformGovernanceProjection?.complianceStatus ?? [],
    auditHistory: platformGovernanceProjection?.auditHistory ?? [],
    governanceAlerts: platformGovernanceProjection?.governanceAlerts ?? [],
    visibilityZones: platformGovernanceProjection?.visibilityZones ?? null,
    rolePermissionMatrix: platformGovernanceProjection?.rolePermissionMatrix ?? [],
    hasFortress: fortressProjection?.hasFortress ?? false,
    fortressSummary: fortressProjection?.summary ?? null,
    fortressComplianceStatus: fortressProjection?.complianceStatus ?? null,
    activeComplianceRules: fortressProjection?.activeComplianceRules ?? [],
    retentionByType: fortressProjection?.retentionByType ?? [],
    archivedData: fortressProjection?.archivedData ?? [],
    legalHolds: fortressProjection?.legalHolds ?? [],
    auditedEvents: fortressProjection?.auditedEvents ?? [],
    registeredExceptions: fortressProjection?.registeredExceptions ?? [],
    exposureBlocks: fortressProjection?.exposureBlocks ?? [],
    purgeSummary: fortressProjection?.purgeSummary ?? null,
    fortressAlerts: fortressProjection?.fortressAlerts ?? [],
    tenantComplianceView: fortressProjection?.tenantComplianceView ?? [],
    hasLifecycle: lifecycleProjection?.hasLifecycle ?? false,
    lifecycleSummary: lifecycleProjection?.summary ?? null,
    lifecycleStatusView: lifecycleProjection?.lifecycleStatus ?? null,
    lifecycleByType: lifecycleProjection?.lifecycleByType ?? [],
    lifecycleArchivedRecords: lifecycleProjection?.archivedRecords ?? [],
    lifecycleLegalHolds: lifecycleProjection?.legalHolds ?? [],
    lifecycleExpungeableRecords: lifecycleProjection?.expungeableRecords ?? [],
    lifecyclePendingApprovals: lifecycleProjection?.pendingApprovals ?? [],
    lifecycleHistory: lifecycleProjection?.lifecycleHistory ?? [],
    lifecycleBlockReasons: lifecycleProjection?.blockReasons ?? [],
    lifecycleAuditTrail: lifecycleProjection?.auditTrailByDocument ?? [],
    lifecycleRetentionPolicies: lifecycleProjection?.retentionPolicies ?? [],
    lifecycleExpirationAlerts: lifecycleProjection?.expirationAlerts ?? [],
    lifecycleDataStates: lifecycleProjection?.dataStates ?? [],
    lifecycleControlCenter: lifecycleProjection?.controlCenter ?? null,
    hasLifecyclePersistence: lifecyclePersistenceProjection?.hasPersistence ?? false,
    lifecyclePersistenceSummary: lifecyclePersistenceProjection?.summary ?? null,
    lifecyclePersistencePendingApprovals: lifecyclePersistenceProjection?.pendingApprovals ?? [],
    lifecyclePersistenceApprovedActions: lifecyclePersistenceProjection?.approvedActions ?? [],
    lifecyclePersistenceRejectedActions: lifecyclePersistenceProjection?.rejectedActions ?? [],
    lifecyclePersistenceArchiveRequests: lifecyclePersistenceProjection?.archiveRequests ?? [],
    lifecyclePersistenceExpungeRequests: lifecyclePersistenceProjection?.expungeRequests ?? [],
    lifecyclePersistenceActiveHolds: lifecyclePersistenceProjection?.activeHolds ?? [],
    lifecyclePersistenceExecutionQueue: lifecyclePersistenceProjection?.executionQueue ?? [],
    lifecyclePersistenceDurableAudit: lifecyclePersistenceProjection?.durableAuditTrail ?? [],
    lifecyclePersistenceStorageIntegration: lifecyclePersistenceProjection?.storageIntegration ?? [],
    lifecyclePersistenceBackupIntegration: lifecyclePersistenceProjection?.backupIntegration ?? [],
    lifecyclePersistenceBlockReasons: lifecyclePersistenceProjection?.blockReasons ?? [],
    lifecyclePersistenceControlCenter: lifecyclePersistenceProjection?.controlCenter ?? null,
    lifecyclePersistenceDurable: lifecyclePersistenceProjection?.durable ?? false,
    knowledgeBridges: Object.freeze({
      consulting: bridgeKnowledgeToConsulting(tenantId),
      decision: bridgeKnowledgeToDecision(tenantId),
      evolution: bridgeKnowledgeToEvolution(tenantId),
    }),
    consultingBridges: Object.freeze({
      decision: bridgeConsultingToDecision(tenantId),
      evolution: bridgeConsultingToEvolution(tenantId),
      intent: bridgeConsultingToIntent(tenantId),
    }),
    decisionBridges: Object.freeze({
      evolution: bridgeDecisionToEvolution(tenantId),
      intent: bridgeDecisionToIntent(tenantId),
    }),
    evolutionBridges: Object.freeze({
      consulting: bridgeEvolutionToConsulting(tenantId),
      decision: bridgeEvolutionToDecision(tenantId),
      dna: bridgeEvolutionToDna(tenantId),
      intent: bridgeEvolutionToIntent(tenantId),
    }),
    dnaBridges: Object.freeze({
      consulting: bridgeDnaToConsulting(tenantId),
      decision: bridgeDnaToDecision(tenantId),
      evolution: bridgeDnaToEvolution(tenantId),
      segmentation: bridgeDnaToSegmentation(tenantId),
    }),
    segmentationBridges: Object.freeze({
      consulting: bridgeSegmentationToConsulting(tenantId),
      decision: bridgeSegmentationToDecision(tenantId),
      evolution: bridgeSegmentationToEvolution(tenantId),
      recommendation: bridgeSegmentationToRecommendation(tenantId),
    }),
    recommendationBridges: Object.freeze({
      consulting: bridgeRecommendationToConsulting(tenantId),
      decision: bridgeRecommendationToDecision(tenantId),
      evolution: bridgeRecommendationToEvolution(tenantId),
      adoption: bridgeRecommendationToAdoption(tenantId),
    }),
    adoptionBridges: Object.freeze({
      consulting: bridgeAdoptionToConsulting(tenantId),
      decision: bridgeAdoptionToDecision(tenantId),
      evolution: bridgeAdoptionToEvolution(tenantId),
      improvement: bridgeAdoptionToImprovement(tenantId),
    }),
    improvementBridges: Object.freeze({
      recommendation: bridgeImprovementToRecommendation(tenantId),
      adoption: bridgeImprovementToAdoption(tenantId),
      consulting: bridgeImprovementToConsulting(tenantId),
      decision: bridgeImprovementToDecision(tenantId),
      evolution: bridgeImprovementToEvolution(tenantId),
    }),
    portfolioBridges: options.groupId
      ? Object.freeze({
          consulting: bridgePortfolioToConsulting(options.groupId, tenantId),
          decision: bridgePortfolioToDecision(options.groupId, tenantId),
          evolution: bridgePortfolioToEvolution(options.groupId, tenantId),
        })
      : null,
    governanceBridges: options.groupId
      ? Object.freeze({
          portfolio: bridgeGovernanceToPortfolioIntelligence(options.groupId, tenantId),
          consulting: bridgeGovernanceToConsulting(options.groupId, tenantId),
          decision: bridgeGovernanceToDecision(options.groupId, tenantId),
        })
      : null,
    fortressBridges: options.groupId
      ? Object.freeze({
          governance: bridgeFortressToGovernance(options.groupId, tenantId),
          portfolio: bridgeFortressToPortfolio(options.groupId, tenantId),
          consulting: bridgeFortressToConsulting(options.groupId, tenantId),
          decision: bridgeFortressToDecision(options.groupId, tenantId),
          intelligence: bridgeFortressToIntelligence(options.groupId, tenantId),
        })
      : null,
    lifecycleBridges: options.groupId
      ? Object.freeze({
          governance: bridgeLifecycleToGovernance(options.groupId, tenantId),
          fortress: bridgeLifecycleToFortress(options.groupId, tenantId),
          portfolio: bridgeLifecycleToPortfolio(options.groupId, tenantId),
          consulting: bridgeLifecycleToConsulting(options.groupId, tenantId),
          decision: bridgeLifecycleToDecision(options.groupId, tenantId),
          intelligence: bridgeLifecycleToIntelligence(options.groupId, tenantId),
        })
      : null,
    lifecyclePersistenceBridges: options.groupId
      ? Object.freeze({
          governance: bridgePersistenceToGovernance(options.groupId, tenantId),
          fortress: bridgePersistenceToFortress(options.groupId, tenantId),
          portfolio: bridgePersistenceToPortfolio(options.groupId, tenantId),
          consulting: bridgePersistenceToConsulting(options.groupId, tenantId),
          decision: bridgePersistenceToDecision(options.groupId, tenantId),
          intelligence: bridgePersistenceToIntelligence(options.groupId, tenantId),
        })
      : null,
  });
}

export default buildIntelligenceHomeProjection;

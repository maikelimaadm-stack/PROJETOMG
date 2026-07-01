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
  });
}

export default buildIntelligenceHomeProjection;

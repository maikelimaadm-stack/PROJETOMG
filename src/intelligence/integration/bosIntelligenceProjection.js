import { buildMemoryEngineBosProjection } from "../memory/engine/memoryToBosProjection.js";
import { bridgeMemoryToIntelligence } from "../memory/engine/memoryToIntelligenceBridge.js";
import { buildKnowledgeGraphBosProjection } from "../knowledge/graph/knowledgeToBosProjection.js";
import { buildConsultingEngineBosProjection } from "../consulting/engine/consultingToBosProjection.js";
import { buildDecisionEngineBosProjection } from "../decision/engine/decisionToBosProjection.js";
import { buildEvolutionEngineBosProjection } from "../evolution/engine/evolutionToBosProjection.js";
import {
  bridgeEvolutionToConsulting,
  bridgeEvolutionToDecision,
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

/** BOS-facing projection — Memory Engine + Knowledge Graph */
export function buildIntelligenceHomeProjection(tenantId = "default") {
  const memoryProjection = buildMemoryEngineBosProjection(tenantId);
  const knowledgeProjection = buildKnowledgeGraphBosProjection(tenantId);
  const consultingProjection = buildConsultingEngineBosProjection(tenantId);
  const decisionProjection = buildDecisionEngineBosProjection(tenantId);
  const evolutionProjection = buildEvolutionEngineBosProjection(tenantId);
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
      intent: bridgeEvolutionToIntent(tenantId),
    }),
  });
}

export default buildIntelligenceHomeProjection;

import { buildMemoryEngineBosProjection } from "../memory/engine/memoryToBosProjection.js";
import { bridgeMemoryToIntelligence } from "../memory/engine/memoryToIntelligenceBridge.js";
import { buildKnowledgeGraphBosProjection } from "../knowledge/graph/knowledgeToBosProjection.js";
import { buildConsultingEngineBosProjection } from "../consulting/engine/consultingToBosProjection.js";
import {
  bridgeConsultingToDecision,
  bridgeConsultingToEvolution,
  bridgeConsultingToIntent,
} from "../consulting/engine/consultingToIntelligenceBridges.js";
import { bridgeKnowledgeToConsulting, bridgeKnowledgeToDecision, bridgeKnowledgeToEvolution } from "../knowledge/graph/knowledgeToIntelligenceBridges.js";
import { processObservationLayer } from "../observation/observationLayer.js";
import { listImprovementOpportunities } from "../registry/improvementOpportunityRegistry.js";

/** BOS-facing projection — Memory Engine + Knowledge Graph */
export function buildIntelligenceHomeProjection(tenantId = "default") {
  const memoryProjection = buildMemoryEngineBosProjection(tenantId);
  const knowledgeProjection = buildKnowledgeGraphBosProjection(tenantId);
  const consultingProjection = buildConsultingEngineBosProjection(tenantId);
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
  });
}

export default buildIntelligenceHomeProjection;

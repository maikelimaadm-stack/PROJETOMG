import { assembleEvolutionContext } from "../../evolution/engine/evolutionContextAssembly.js";
import { summarizeEvolutionEngine } from "../../evolution/engine/evolutionSummarization.js";
import { computeEvolutionMaturity } from "../../evolution/engine/evolutionMaturityModel.js";
import { buildEvolutionTimeline } from "../../evolution/engine/evolutionTimeline.js";
import { summarizeDecisionEngine } from "../../decision/engine/decisionSummarization.js";
import { summarizeConsultingEngine } from "../../consulting/engine/consultingSummarization.js";
import { summarizeKnowledgeGraph } from "../../knowledge/graph/knowledgeSummarization.js";
import { summarizeEnterpriseMemory } from "../../memory/engine/memorySummarization.js";
import { processObservationLayer } from "../../observation/observationLayer.js";

/** Assemble Business DNA context from full intelligence stack */
export function assembleBusinessDnaContext(tenantId = "default") {
  const evolutionContext = assembleEvolutionContext(tenantId);
  const evolutionSummary = summarizeEvolutionEngine(tenantId);
  const decisionSummary = summarizeDecisionEngine(tenantId);
  const consultingSummary = summarizeConsultingEngine(tenantId);
  const graphSummary = summarizeKnowledgeGraph(tenantId);
  const memorySummary = summarizeEnterpriseMemory(tenantId);
  const maturity = computeEvolutionMaturity(evolutionContext);
  const timeline = buildEvolutionTimeline(tenantId);
  const observation = processObservationLayer(tenantId);

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    evolutionContext,
    evolutionSummary,
    decisionSummary,
    consultingSummary,
    graphSummary,
    memorySummary,
    maturity,
    timeline,
    observation,
    patterns: observation.patterns,
    explainable: true,
    belongsToEnterprise: true,
    individualProfilingForbidden: true,
    aiGenerated: false,
  });
}

export default assembleBusinessDnaContext;

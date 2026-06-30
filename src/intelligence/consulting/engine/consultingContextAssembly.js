import { assembleMemoryContext } from "../../memory/engine/memoryContextAssembly.js";
import { summarizeEnterpriseMemory } from "../../memory/engine/memorySummarization.js";
import { summarizeKnowledgeGraph } from "../../knowledge/graph/knowledgeSummarization.js";
import { retrieveKnowledgeByContext } from "../../knowledge/graph/knowledgeRetrieval.js";
import { listConsultingSignals } from "../../registry/consultingSignals.js";
import { listImprovementOpportunities } from "../../registry/improvementOpportunityRegistry.js";
import { processObservationLayer } from "../../observation/observationLayer.js";
import { listEngineConsultingSignals } from "./consultingEngineStore.js";

/** Assemble consulting context from Memory + Knowledge Graph + signals */
export function assembleConsultingContext(tenantId = "default") {
  const memoryContext = assembleMemoryContext(tenantId);
  const memorySummary = summarizeEnterpriseMemory(tenantId);
  const graphSummary = summarizeKnowledgeGraph(tenantId);
  const observation = processObservationLayer(tenantId);
  const foundationSignals = listConsultingSignals(tenantId);
  const engineSignals = listEngineConsultingSignals(tenantId);
  const opportunities = listImprovementOpportunities(tenantId);
  const graphContext = retrieveKnowledgeByContext(tenantId, { limit: 20 });

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    memoryContext,
    memorySummary,
    graphSummary,
    observation,
    foundationSignals,
    engineSignals,
    opportunities,
    graphNodes: graphContext.nodes,
    graphEdges: graphContext.edges,
    patterns: observation.patterns,
    explainable: true,
    belongsToEnterprise: true,
    aiGenerated: false,
  });
}

export default assembleConsultingContext;

import { assembleMemoryContext } from "../../memory/engine/memoryContextAssembly.js";
import { summarizeEnterpriseMemory } from "../../memory/engine/memorySummarization.js";
import { summarizeKnowledgeGraph } from "../../knowledge/graph/knowledgeSummarization.js";
import { retrieveKnowledgeByContext } from "../../knowledge/graph/knowledgeRetrieval.js";
import { assembleConsultingContext } from "../../consulting/engine/consultingContextAssembly.js";
import { retrieveConsultingByContext } from "../../consulting/engine/consultingRetrieval.js";
import { summarizeConsultingEngine } from "../../consulting/engine/consultingSummarization.js";
import { processObservationLayer } from "../../observation/observationLayer.js";

/** Assemble decision context from Memory + Graph + Consulting */
export function assembleDecisionContext(tenantId = "default") {
  const memoryContext = assembleMemoryContext(tenantId);
  const memorySummary = summarizeEnterpriseMemory(tenantId);
  const graphSummary = summarizeKnowledgeGraph(tenantId);
  const graphContext = retrieveKnowledgeByContext(tenantId, { limit: 20 });
  const consultingContext = assembleConsultingContext(tenantId);
  const consultingRetrieved = retrieveConsultingByContext(tenantId);
  const consultingSummary = summarizeConsultingEngine(tenantId);
  const observation = processObservationLayer(tenantId);

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    memoryContext,
    memorySummary,
    graphSummary,
    graphNodes: graphContext.nodes,
    graphEdges: graphContext.edges,
    consultingContext,
    consultingRetrieved,
    consultingSummary,
    observation,
    explainable: true,
    belongsToEnterprise: true,
    aiGenerated: false,
  });
}

export default assembleDecisionContext;

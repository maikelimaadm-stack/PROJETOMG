import { assembleMemoryContext } from "../../memory/engine/memoryContextAssembly.js";
import { summarizeEnterpriseMemory } from "../../memory/engine/memorySummarization.js";
import { summarizeKnowledgeGraph } from "../../knowledge/graph/knowledgeSummarization.js";
import { retrieveKnowledgeByContext } from "../../knowledge/graph/knowledgeRetrieval.js";
import { retrieveConsultingByContext } from "../../consulting/engine/consultingRetrieval.js";
import { retrieveDecisionsByContext } from "../../decision/engine/decisionRetrieval.js";
import { processObservationLayer } from "../../observation/observationLayer.js";
import { listImprovementOpportunities } from "../../registry/improvementOpportunityRegistry.js";

/** Assemble evolution context from full intelligence stack */
export function assembleEvolutionContext(tenantId = "default") {
  const memoryContext = assembleMemoryContext(tenantId);
  const memorySummary = summarizeEnterpriseMemory(tenantId);
  const graphSummary = summarizeKnowledgeGraph(tenantId);
  const graphContext = retrieveKnowledgeByContext(tenantId, { limit: 20 });
  const consultingRetrieved = retrieveConsultingByContext(tenantId);
  const decisionRetrieved = retrieveDecisionsByContext(tenantId);
  const observation = processObservationLayer(tenantId);
  const opportunities = listImprovementOpportunities(tenantId);

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    memoryContext,
    memorySummary,
    graphSummary,
    graphNodes: graphContext.nodes,
    graphEdges: graphContext.edges,
    consultingRetrieved,
    decisionRetrieved,
    observation,
    opportunities,
    explainable: true,
    belongsToEnterprise: true,
    aiGenerated: false,
  });
}

export default assembleEvolutionContext;

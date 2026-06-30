import { KNOWLEDGE_NODE_KINDS } from "./knowledgeGraphContracts.js";
import { summarizeKnowledgeGraph } from "./knowledgeSummarization.js";
import { buildKnowledgeSeedsRegistry } from "./knowledgeSeedsRegistry.js";
import { retrieveKnowledgeByContext } from "./knowledgeRetrieval.js";
import { runConsultingEngine } from "../../consulting/engine/runConsultingEngine.js";

export function bridgeKnowledgeToConsulting(tenantId = "default") {
  const consulting = runConsultingEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    summary: summarizeKnowledgeGraph(tenantId),
    seeds: buildKnowledgeSeedsRegistry(tenantId),
    consultingSummary: consulting.summary,
    consultingEngineReady: true,
    autonomousAdviceForbidden: true,
  });
}

export function bridgeKnowledgeToDecision(tenantId = "default") {
  const decisions = retrieveKnowledgeByContext(tenantId, {
    kind: KNOWLEDGE_NODE_KINDS.DECISION,
    limit: 20,
  });
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    decisionNodes: decisions.nodes,
    decisionEdges: decisions.edges,
    decisionEngineReady: false,
    autonomousDecisionForbidden: true,
  });
}

export function bridgeKnowledgeToEvolution(tenantId = "default") {
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    summary: summarizeKnowledgeGraph(tenantId),
    patternRelations: retrieveKnowledgeByContext(tenantId, {
      relationshipKind: "pattern.recurs.in.operation",
      limit: 10,
    }),
    evolutionEngineReady: false,
    autoEvolutionForbidden: true,
  });
}

export default { bridgeKnowledgeToConsulting, bridgeKnowledgeToDecision, bridgeKnowledgeToEvolution };

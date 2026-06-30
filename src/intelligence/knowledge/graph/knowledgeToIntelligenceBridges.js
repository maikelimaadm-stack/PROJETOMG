import { KNOWLEDGE_NODE_KINDS } from "./knowledgeGraphContracts.js";
import { summarizeKnowledgeGraph } from "./knowledgeSummarization.js";
import { buildKnowledgeSeedsRegistry } from "./knowledgeSeedsRegistry.js";
import { retrieveKnowledgeByContext } from "./knowledgeRetrieval.js";
import { runConsultingEngine } from "../../consulting/engine/runConsultingEngine.js";
import { runDecisionEngine } from "../../decision/engine/runDecisionEngine.js";
import { runEvolutionEngine } from "../../evolution/engine/runEvolutionEngine.js";

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
  const decision = runDecisionEngine(tenantId);
  const graphDecisions = retrieveKnowledgeByContext(tenantId, {
    kind: KNOWLEDGE_NODE_KINDS.DECISION,
    limit: 20,
  });
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    decisionNodes: graphDecisions.nodes,
    decisionEdges: graphDecisions.edges,
    decisionSummary: decision.summary,
    decisionEngineReady: true,
    autonomousDecisionForbidden: true,
  });
}

export function bridgeKnowledgeToEvolution(tenantId = "default") {
  const evolution = runEvolutionEngine(tenantId);
  return Object.freeze({
    tenantId,
    bridgedAt: new Date().toISOString(),
    summary: summarizeKnowledgeGraph(tenantId),
    patternRelations: retrieveKnowledgeByContext(tenantId, {
      relationshipKind: "pattern.recurs.in.operation",
      limit: 10,
    }),
    evolutionSummary: evolution.summary,
    evolutionEngineReady: true,
    autoEvolutionForbidden: true,
  });
}

export default { bridgeKnowledgeToConsulting, bridgeKnowledgeToDecision, bridgeKnowledgeToEvolution };

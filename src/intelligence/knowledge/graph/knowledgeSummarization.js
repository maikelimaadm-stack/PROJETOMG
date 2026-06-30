import { listKnowledgeNodes, listKnowledgeEdges } from "./knowledgeGraphStore.js";
import { KNOWLEDGE_RELATIONSHIP_KINDS } from "./knowledgeGraphContracts.js";

export function summarizeKnowledgeGraph(tenantId = "default") {
  const nodes = listKnowledgeNodes(tenantId, { limit: 500 });
  const edges = listKnowledgeEdges(tenantId, { limit: 1000 });
  const byKind = {};
  for (const node of nodes) {
    byKind[node.kind] = (byKind[node.kind] ?? 0) + 1;
  }
  const recurringPatterns = edges.filter(
    (e) => e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.PATTERN_RECURS_OPERATION
  ).length;

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    nodeCount: nodes.length,
    edgeCount: edges.length,
    byKind: Object.freeze(byKind),
    recurringPatterns,
    headline:
      nodes.length === 0
        ? "O conhecimento organizacional está pronto para conectar memória, ativos e processos."
        : `${nodes.length} entidades de negócio conectadas por ${edges.length} relações explicáveis.`,
    explainable: true,
    aiGenerated: false,
    belongsToEnterprise: true,
  });
}

export default summarizeKnowledgeGraph;

import { listKnowledgeNodes, listKnowledgeEdges } from "./knowledgeGraphStore.js";
import { findRelatedNodes } from "./graphTraversal.js";
import { explainKnowledgeRelationship } from "./knowledgeExplainability.js";
import { querySemanticIndex } from "./semanticIndexing.js";

export function retrieveKnowledgeByContext(tenantId = "default", query = {}) {
  if (query.refId) {
    const nodes = querySemanticIndex(tenantId, { refId: query.refId });
    return Object.freeze({ nodes, edges: expandEdges(tenantId, nodes) });
  }
  if (query.nodeId) {
    const related = findRelatedNodes(tenantId, query.nodeId, query.limit ?? 10);
    const edges = expandEdges(tenantId, related);
    return Object.freeze({ nodes: related, edges });
  }
  if (query.relationshipKind) {
    const edges = listKnowledgeEdges(tenantId, { relationshipKind: query.relationshipKind, limit: query.limit ?? 20 });
    return Object.freeze({ nodes: [], edges });
  }
  const nodes = listKnowledgeNodes(tenantId, { kind: query.kind, limit: query.limit ?? 20 });
  return Object.freeze({ nodes, edges: expandEdges(tenantId, nodes) });
}

function expandEdges(tenantId, nodes) {
  const edges = [];
  for (const node of nodes) {
    edges.push(...listKnowledgeEdges(tenantId, { fromNodeId: node.nodeId, limit: 10 }));
  }
  return edges.map(explainKnowledgeRelationship);
}

export default retrieveKnowledgeByContext;

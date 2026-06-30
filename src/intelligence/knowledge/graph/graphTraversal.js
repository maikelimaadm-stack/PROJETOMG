import { listKnowledgeEdges, listKnowledgeNodes } from "./knowledgeGraphStore.js";

/** Graph traversal — tenant-scoped, explainable */
export function traverseKnowledgeGraph(tenantId = "default", startNodeId, options = {}) {
  const maxDepth = options.maxDepth ?? 3;
  const visited = new Set();
  const path = [];

  function walk(nodeId, depth) {
    if (depth > maxDepth || visited.has(nodeId)) return;
    visited.add(nodeId);
    const node = listKnowledgeNodes(tenantId, { limit: 500 }).find((n) => n.nodeId === nodeId);
    if (node) path.push(Object.freeze({ depth, node }));
    const edges = listKnowledgeEdges(tenantId, { fromNodeId: nodeId, limit: 50 });
    for (const edge of edges) {
      path.push(Object.freeze({ depth, edge }));
      walk(edge.toNodeId, depth + 1);
    }
  }

  walk(startNodeId, 0);
  return Object.freeze({
    tenantId,
    startNodeId,
    path: Object.freeze(path),
    explainable: true,
  });
}

export function findRelatedNodes(tenantId, nodeId, limit = 10) {
  const edges = [
    ...listKnowledgeEdges(tenantId, { fromNodeId: nodeId, limit }),
    ...listKnowledgeEdges(tenantId, { toNodeId: nodeId, limit }),
  ];
  const nodeIds = new Set();
  for (const edge of edges) {
    nodeIds.add(edge.fromNodeId);
    nodeIds.add(edge.toNodeId);
  }
  nodeIds.delete(nodeId);
  const nodes = listKnowledgeNodes(tenantId, { limit: 500 }).filter((n) => nodeIds.has(n.nodeId));
  return nodes.slice(0, limit);
}

export default traverseKnowledgeGraph;

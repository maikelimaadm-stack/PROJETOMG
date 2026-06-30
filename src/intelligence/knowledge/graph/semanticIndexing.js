import { listKnowledgeNodes, listKnowledgeEdges } from "./knowledgeGraphStore.js";

const semanticIndex = new Map();

export function indexKnowledgeSemantically(tenantId, node, edges = []) {
  const tenantIndex = semanticIndex.get(tenantId) ?? { byKind: {}, byRef: {}, byLabel: {} };
  tenantIndex.byKind[node.kind] = tenantIndex.byKind[node.kind] ?? [];
  if (!tenantIndex.byKind[node.kind].includes(node.nodeId)) {
    tenantIndex.byKind[node.kind].push(node.nodeId);
  }
  if (node.refId) tenantIndex.byRef[node.refId] = node.nodeId;
  const labelKey = (node.label ?? "").toLowerCase().slice(0, 40);
  if (labelKey) {
    tenantIndex.byLabel[labelKey] = tenantIndex.byLabel[labelKey] ?? [];
    tenantIndex.byLabel[labelKey].push(node.nodeId);
  }
  for (const edge of edges) {
    tenantIndex.byRef[edge.edgeId] = edge.edgeId;
  }
  semanticIndex.set(tenantId, tenantIndex);
  return tenantIndex;
}

export function querySemanticIndex(tenantId, query = {}) {
  const index = semanticIndex.get(tenantId) ?? { byKind: {}, byRef: {}, byLabel: {} };
  if (query.kind) return (index.byKind[query.kind] ?? []).map((id) => findNode(tenantId, id)).filter(Boolean);
  if (query.refId && index.byRef[query.refId]) {
    const node = findNode(tenantId, index.byRef[query.refId]);
    return node ? [node] : [];
  }
  return [];
}

function findNode(tenantId, nodeId) {
  return listKnowledgeNodes(tenantId, { limit: 500 }).find((n) => n.nodeId === nodeId) ?? null;
}

export function rebuildSemanticIndex(tenantId) {
  const nodes = listKnowledgeNodes(tenantId, { limit: 500 });
  const edges = listKnowledgeEdges(tenantId, { limit: 1000 });
  semanticIndex.delete(tenantId);
  for (const node of nodes) indexKnowledgeSemantically(tenantId, node, edges);
  return semanticIndex.get(tenantId);
}

export default indexKnowledgeSemantically;

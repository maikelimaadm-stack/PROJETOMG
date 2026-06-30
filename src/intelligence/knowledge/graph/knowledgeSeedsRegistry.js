import { listKnowledgeNodes, listKnowledgeEdges } from "./knowledgeGraphStore.js";

export function buildKnowledgeSeedsRegistry(tenantId = "default") {
  const nodes = listKnowledgeNodes(tenantId, { limit: 100 });
  const edges = listKnowledgeEdges(tenantId, { limit: 200 });
  const seeds = nodes.map((node) =>
    Object.freeze({
      seedId: `kgseed-${node.nodeId}`,
      tenantId,
      nodeId: node.nodeId,
      kind: node.kind,
      label: node.label,
      refId: node.refId,
      tenantOwned: true,
      aiGenerated: false,
      relatedEdgeCount: edges.filter(
        (e) => e.fromNodeId === node.nodeId || e.toNodeId === node.nodeId
      ).length,
    })
  );
  return Object.freeze({
    tenantId,
    seedCount: seeds.length,
    seeds: Object.freeze(seeds),
    registeredAt: new Date().toISOString(),
  });
}

export default buildKnowledgeSeedsRegistry;

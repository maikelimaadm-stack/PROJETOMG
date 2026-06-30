const lineageIndex = new Map();

export function indexKnowledgeLineage(tenantId, nodeOrEdge) {
  const tenantIndex = lineageIndex.get(tenantId) ?? {};
  for (const link of nodeOrEdge.lineage ?? []) {
    const key = `${link.kind}:${link.ref}`;
    tenantIndex[key] = tenantIndex[key] ?? [];
    const id = nodeOrEdge.nodeId ?? nodeOrEdge.edgeId;
    if (!tenantIndex[key].includes(id)) tenantIndex[key].push(id);
  }
  if (nodeOrEdge.memoryId) {
    tenantIndex[`memory:${nodeOrEdge.memoryId}`] = tenantIndex[`memory:${nodeOrEdge.memoryId}`] ?? [];
    tenantIndex[`memory:${nodeOrEdge.memoryId}`].push(nodeOrEdge.nodeId ?? nodeOrEdge.edgeId);
  }
  lineageIndex.set(tenantId, tenantIndex);
  return tenantIndex;
}

export function queryLineageIndex(tenantId, lineageRef) {
  const tenantIndex = lineageIndex.get(tenantId) ?? {};
  return tenantIndex[lineageRef] ?? [];
}

export default indexKnowledgeLineage;

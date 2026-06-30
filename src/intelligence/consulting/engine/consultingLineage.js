export function buildConsultingLineage(input) {
  return Object.freeze([
    ...(input.memoryIds ?? []).map((id) =>
      Object.freeze({ source: "enterprise.memory", refId: id, role: "evidence" })
    ),
    ...(input.nodeIds ?? []).map((id) =>
      Object.freeze({ source: "knowledge.graph", refId: id, role: "context" })
    ),
    ...(input.edgeIds ?? []).map((id) =>
      Object.freeze({ source: "knowledge.graph.edge", refId: id, role: "relationship" })
    ),
    ...(input.signalIds ?? []).map((id) =>
      Object.freeze({ source: "consulting.signal", refId: id, role: "signal" })
    ),
  ]);
}

export function traceConsultingLineage(lineage = []) {
  return Object.freeze({
    memoryRefs: lineage.filter((l) => l.source === "enterprise.memory"),
    graphNodeRefs: lineage.filter((l) => l.source === "knowledge.graph"),
    graphEdgeRefs: lineage.filter((l) => l.source === "knowledge.graph.edge"),
    signalRefs: lineage.filter((l) => l.source === "consulting.signal"),
    traceable: lineage.length > 0,
  });
}

export default { buildConsultingLineage, traceConsultingLineage };

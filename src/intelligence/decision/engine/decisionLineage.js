export function buildDecisionLineage(input) {
  return Object.freeze([
    ...(input.memoryIds ?? []).map((id) =>
      Object.freeze({ source: "enterprise.memory", refId: id, role: "evidence" })
    ),
    ...(input.nodeIds ?? []).map((id) =>
      Object.freeze({ source: "knowledge.graph", refId: id, role: "context" })
    ),
    ...(input.consultingIds ?? []).map((id) =>
      Object.freeze({ source: "consulting.engine", refId: id, role: "recommendation" })
    ),
    ...(input.planIds ?? []).map((id) =>
      Object.freeze({ source: "consulting.plan", refId: id, role: "plan" })
    ),
  ]);
}

export function traceDecisionLineage(lineage = []) {
  return Object.freeze({
    memoryRefs: lineage.filter((l) => l.source === "enterprise.memory"),
    graphRefs: lineage.filter((l) => l.source === "knowledge.graph"),
    consultingRefs: lineage.filter((l) => l.source.startsWith("consulting")),
    traceable: lineage.length > 0,
  });
}

export default { buildDecisionLineage, traceDecisionLineage };

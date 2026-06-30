export function buildDnaLineage(input) {
  return Object.freeze([
    ...(input.memoryIds ?? []).map((id) =>
      Object.freeze({ source: "enterprise.memory", refId: id, role: "history" })
    ),
    ...(input.evolutionIds ?? []).map((id) =>
      Object.freeze({ source: "evolution.engine", refId: id, role: "evolution" })
    ),
    ...(input.decisionIds ?? []).map((id) =>
      Object.freeze({ source: "decision.engine", refId: id, role: "decision" })
    ),
    ...(input.consultingIds ?? []).map((id) =>
      Object.freeze({ source: "consulting.engine", refId: id, role: "consulting" })
    ),
  ]);
}

export default { buildDnaLineage };

export function buildSegmentationLineage(input) {
  return Object.freeze([
    ...(input.dnaProfileIds ?? []).map((id) =>
      Object.freeze({ source: "business.dna", refId: id, role: "identity" })
    ),
    ...(input.evolutionIds ?? []).map((id) =>
      Object.freeze({ source: "evolution.engine", refId: id, role: "evolution" })
    ),
    ...(input.memoryIds ?? []).map((id) =>
      Object.freeze({ source: "enterprise.memory", refId: id, role: "history" })
    ),
  ]);
}

export default { buildSegmentationLineage };

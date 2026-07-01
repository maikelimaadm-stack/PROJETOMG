export function buildOptimizationLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "improvement", refId: partial.improvementLoopId ?? null }),
    Object.freeze({ source: "opportunity", refId: partial.opportunityId ?? null }),
    Object.freeze({ source: "optimization_loop", refId: partial.loopId ?? null }),
  ].filter((l) => l.refId));
}

export default buildOptimizationLineage;

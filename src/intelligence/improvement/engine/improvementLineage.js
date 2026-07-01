export function buildImprovementLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "adoption", refId: partial.adoptionId ?? null }),
    Object.freeze({ source: "recommendation", refId: partial.recommendationId ?? null }),
    Object.freeze({ source: "opportunity", refId: partial.opportunityId ?? null }),
    Object.freeze({ source: "improvement_loop", refId: partial.loopId ?? null }),
  ].filter((l) => l.refId));
}

export default buildImprovementLineage;

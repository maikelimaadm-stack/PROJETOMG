export function buildAdoptionLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "recommendation", refId: partial.recommendationId ?? null }),
    Object.freeze({ source: "segmentation", refId: partial.segmentationRef ?? null }),
    Object.freeze({ source: "dna", refId: partial.dnaRef ?? null }),
    Object.freeze({ source: "adoption_tracking", refId: partial.adoptionId ?? null }),
  ].filter((l) => l.refId));
}

export default buildAdoptionLineage;

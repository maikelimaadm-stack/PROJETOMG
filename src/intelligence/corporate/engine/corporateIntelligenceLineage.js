export function buildCorporateIntelligenceLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "adoption", refId: partial.adoptionRef ?? null }),
    Object.freeze({ source: "dna", refId: partial.dnaRef ?? null }),
    Object.freeze({ source: "segmentation", refId: partial.segmentationRef ?? null }),
    Object.freeze({ source: "group_scope", refId: partial.groupId ?? null }),
  ].filter((l) => l.refId));
}

export default buildCorporateIntelligenceLineage;

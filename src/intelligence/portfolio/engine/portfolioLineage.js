export function buildPortfolioLineage(partial = {}) {
  return Object.freeze([
    Object.freeze({ source: "group_scope", refId: partial.groupId ?? null }),
    Object.freeze({ source: "dna", refId: partial.dnaRef ?? null }),
    Object.freeze({ source: "adoption", refId: partial.adoptionRef ?? null }),
    Object.freeze({ source: "improvement", refId: partial.improvementRef ?? null }),
  ].filter((l) => l.refId));
}

export default buildPortfolioLineage;

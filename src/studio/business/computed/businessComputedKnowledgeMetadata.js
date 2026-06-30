export function createBusinessComputedKnowledgeMetadata(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-knowledge-metadata-v1",
    businessRuleSummary: partial.businessRuleSummary ?? "",
    knowledgeTags: Object.freeze(partial.knowledgeTags ?? []),
    patternId: partial.patternId ?? null,
    processMiningHook: partial.processMiningHook ?? "extension_point_only",
    businessDnaFacet: partial.businessDnaFacet ?? "computation",
  });
}

export default createBusinessComputedKnowledgeMetadata;

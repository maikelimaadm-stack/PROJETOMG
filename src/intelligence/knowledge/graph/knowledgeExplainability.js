export function createRelationshipExplainability(partial) {
  return Object.freeze({
    businessSummary: partial.businessSummary ?? partial.label ?? "",
    whyRelated:
      partial.whyRelated ??
      partial.businessSummary ??
      "Relação identificada a partir da memória operacional da empresa.",
    explainable: true,
    aiGenerated: false,
  });
}

export function explainKnowledgeRelationship(edge) {
  return Object.freeze({
    edgeId: edge.edgeId,
    relationship: edge.label,
    because: edge.explainability?.whyRelated ?? edge.explainability?.businessSummary ?? "",
    from: edge.fromNodeId,
    to: edge.toNodeId,
  });
}

export default createRelationshipExplainability;

export function buildRecommendationLineage(input) {
  return Object.freeze([
    ...(input.segmentationIds ?? []).map((id) =>
      Object.freeze({ source: "segmentation.engine", refId: id, role: "segment" })
    ),
    ...(input.dnaProfileIds ?? []).map((id) =>
      Object.freeze({ source: "business.dna", refId: id, role: "identity" })
    ),
    ...(input.templateIds ?? []).map((id) =>
      Object.freeze({ source: "template.library", refId: id, role: "template" })
    ),
    ...(input.sourceTenantIds ?? []).map((id) =>
      Object.freeze({ source: "authorized.tenant", refId: id, role: "replication_source" })
    ),
  ]);
}

export function buildReplicationLineage(input) {
  return Object.freeze([
    ...(input.recommendationIds ?? []).map((id) =>
      Object.freeze({ source: "recommendation.engine", refId: id, role: "recommendation" })
    ),
    ...(input.sourceTenantIds ?? []).map((id) =>
      Object.freeze({ source: "authorized.tenant", refId: id, role: "source" })
    ),
    ...(input.targetTenantIds ?? []).map((id) =>
      Object.freeze({ source: "authorized.tenant", refId: id, role: "target" })
    ),
  ]);
}

export default { buildRecommendationLineage, buildReplicationLineage };

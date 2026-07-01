export function explainRecommendation(rec) {
  return Object.freeze({
    id: rec.recommendationId,
    title: rec.title,
    because: rec.summary,
    expectedImpact: rec.expectedImpact,
    confidence: rec.confidence,
    requiresHumanApproval: rec.requiresHumanApproval !== false,
    evidenceCount: rec.evidenceRefs?.length ?? 0,
  });
}

export function explainReplication(replication) {
  return Object.freeze({
    id: replication.replicationId,
    title: replication.title,
    because: replication.summary,
    compatibilityScore: replication.compatibilityScore,
    requiresHumanApproval: replication.requiresHumanApproval !== false,
    sourceTenantId: replication.sourceTenantId,
  });
}

export default { explainRecommendation, explainReplication };

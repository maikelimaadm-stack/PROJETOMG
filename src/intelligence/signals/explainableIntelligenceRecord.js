/** Explainable Intelligence Record — every signal must be explainable */
export function createExplainableIntelligenceRecord(source) {
  return Object.freeze({
    recordId: `eir-${source.eventId ?? source.signalId ?? Date.now()}`,
    whatHappened: source.explainability?.whatHappened ?? source.whatHappened ?? "",
    businessSummary: source.explainability?.businessSummary ?? source.businessSummary ?? "",
    when: source.occurredAt ?? source.recordedAt ?? new Date().toISOString(),
    tenantId: source.tenantId ?? "default",
    assetInvolved: source.subject?.assetId ?? source.assetId ?? null,
    workflowInvolved: source.subject?.workflowId ?? source.workflowId ?? null,
    intentInvolved: source.subject?.intentId ?? source.intentId ?? null,
    outcome: source.outcome ?? null,
    impact: source.explainability?.businessImpact ?? source.businessImpact ?? null,
    evidenceRefs: Object.freeze(
      source.explainability?.evidenceRefs ?? source.evidenceRefs ?? [source.eventId].filter(Boolean)
    ),
    humanDecision: source.outcome?.humanDecision ?? source.humanDecision ?? false,
    automated: false,
    explainable: true,
  });
}

export default createExplainableIntelligenceRecord;

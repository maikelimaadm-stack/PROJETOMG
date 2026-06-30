export function createMemoryExplainability(envelope) {
  return Object.freeze({
    businessSummary: envelope.explainability?.businessSummary ?? "",
    whatHappened: envelope.explainability?.whatHappened ?? "",
    businessImpact: envelope.explainability?.businessImpact ?? null,
    whyItHappened:
      envelope.explainability?.whatHappened ??
      envelope.explainability?.businessSummary ??
      "",
    evidenceRefs: Object.freeze(envelope.explainability?.evidenceRefs ?? [envelope.eventId]),
    explainable: true,
    aiGenerated: false,
  });
}

export function explainMemoryRecord(record) {
  return Object.freeze({
    memoryId: record.memoryId,
    summary: record.explainability?.businessSummary ?? "",
    why: record.whyItHappened ?? record.explainability?.whyItHappened ?? "",
    impact: record.businessImpact ?? record.explainability?.businessImpact ?? null,
    when: record.occurredAt,
    who: record.actorId ?? "Operação registrada",
  });
}

export default createMemoryExplainability;

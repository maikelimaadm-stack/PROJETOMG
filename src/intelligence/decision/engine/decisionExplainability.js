export function explainDecisionDocument(decision) {
  return Object.freeze({
    id: decision.decisionId,
    title: decision.title,
    because: decision.summary,
    confidence: decision.confidence,
    lifecycleState: decision.lifecycleState,
    evidenceCount: decision.evidenceRefs?.length ?? 0,
    traceable: (decision.lineage?.length ?? 0) > 0,
    humanApprovalRequired: decision.ownership?.humanApprovalRequired !== false,
    autonomousExecutionForbidden: decision.autonomousExecutionForbidden !== false,
  });
}

export function explainDecisionOption(option) {
  return Object.freeze({
    id: option.optionId,
    label: option.label,
    impact: option.expectedImpact,
    risk: option.riskLevel,
    confidence: option.confidence,
    because: option.description,
  });
}

export default { explainDecisionDocument, explainDecisionOption };

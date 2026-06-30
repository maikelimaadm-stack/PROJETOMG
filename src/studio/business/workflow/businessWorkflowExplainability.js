export function buildBusinessWorkflowExplainability(intentDocument, session, workflow, metadata) {
  return Object.freeze({
    schemaVersion: "mak-business-workflow-explainability-v1",
    businessSummary: workflow.businessProcessSummary ?? intentDocument.intentPhrase,
    whyExists: "Business process requires structured approval and operational tracking.",
    statesExplained: (workflow.states ?? []).map((s) => `${s.label}: ${s.description ?? s.id}`),
    transitionsExplained: (workflow.transitions ?? []).map((t) => `${t.label} (${t.from} → ${t.to})`),
    approvers: workflow.assignments ?? [],
    slaSummary: workflow.sla?.summary ?? "Prazo definido em linguagem de negócio.",
    generatedBy: session.initiatedBy,
    intentId: intentDocument.id,
    workflowId: workflow.id,
    derivationId: metadata?.derivationId,
    humanApprovalRequired: metadata?.policies?.humanApprovalRequired !== false,
  });
}

export default buildBusinessWorkflowExplainability;

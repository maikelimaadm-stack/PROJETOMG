export function createBusinessWorkflowPreview(workflow, partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-workflow-preview-v1",
    workflowId: workflow.id,
    title: workflow.businessProcessSummary,
    currentStateLabel: partial.currentStateLabel ?? workflow.states?.[0]?.label ?? "Solicitado",
    nextActions: (workflow.transitions ?? [])
      .filter((t) => t.from === (partial.currentStateId ?? workflow.states?.[0]?.id))
      .map((t) => t.label),
    approvers: (workflow.assignments ?? []).map((a) => a.label ?? a.role),
    slaLabel: workflow.sla?.label ?? "Prazo de aprovação configurado",
    explainability: partial.explainability ?? null,
  });
}

export default createBusinessWorkflowPreview;

export function createBusinessWorkflowSynchronization(partial = {}) {
  return Object.freeze({
    policy: partial.policy ?? "sync_on_intent_change",
    lastSyncedAt: partial.lastSyncedAt ?? null,
    pendingChanges: Object.freeze([...(partial.pendingChanges ?? [])]),
  });
}

export function planBusinessWorkflowSynchronization(workflow, intentDocument) {
  return Object.freeze({
    workflowId: workflow.id,
    intentRevision: intentDocument.revision,
    actions: Object.freeze([
      Object.freeze({ action: "review_states", label: "Revisar estados de negócio" }),
      Object.freeze({ action: "review_approvers", label: "Revisar responsáveis" }),
    ]),
  });
}

export default createBusinessWorkflowSynchronization;

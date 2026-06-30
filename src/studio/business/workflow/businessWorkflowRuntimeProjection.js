export function createBusinessWorkflowRuntimeProjection(workflow, projectionMeta = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-workflow-runtime-projection-v1",
    workflowId: workflow.id,
    workflowConfigId: projectionMeta.workflowConfigId ?? `wcfg-${workflow.id}`,
    moduleId: workflow.moduleId ?? "default",
    entityId: workflow.entityId ?? "default",
    runtimeReceives: "derived_projection_only",
    projectionOnly: true,
    derivedFromBusinessWorkflow: true,
    businessWorkflowId: workflow.id,
    intentId: workflow.intentId,
    states: workflow.states,
    transitions: workflow.transitions,
    assignments: workflow.assignments,
    sla: workflow.sla,
    metadata: Object.freeze({ ...(projectionMeta.metadata ?? {}) }),
  });
}

export default createBusinessWorkflowRuntimeProjection;

/** Workflow config projection FROM Business Workflow — not from BPMN/designer */

export const WORKFLOW_CONFIG_PROJECTION_VERSION = "mak-workflow-config-projection-v1";

export function createWorkflowProjectionFromBusinessWorkflow(workflow, derivationMetadata) {
  const definition = Object.freeze({
    id: `wcfg-${workflow.id}`,
    start: workflow.states?.[0]?.id ?? "solicitado",
    finish: Object.freeze(["concluido", "rejeitado"]),
    states: Object.fromEntries((workflow.states ?? []).map((s) => [s.id, s])),
    transitions: workflow.transitions ?? [],
    steps: Object.freeze({
      assignments: workflow.assignments ?? [],
      sla: workflow.sla ?? null,
    }),
  });

  return Object.freeze({
    schemaVersion: WORKFLOW_CONFIG_PROJECTION_VERSION,
    id: definition.id,
    moduleId: workflow.moduleId ?? "default",
    entityId: workflow.entityId ?? "default",
    processId: workflow.processId,
    engineVersion: 1,
    workflowDefinitionCount: 1,
    workflowDefinitions: Object.freeze([
      Object.freeze({
        id: definition.id,
        start: definition.start,
        finish: definition.finish,
        states: definition.states,
        transitions: definition.transitions,
        steps: definition.steps,
      }),
    ]),
    metadata: Object.freeze({
      derivedFromIntent: true,
      derivedFromBusinessWorkflow: true,
      businessWorkflowId: workflow.id,
      intentId: workflow.intentId,
      intentRevision: workflow.intentRevision,
      derivationId: derivationMetadata?.derivationId,
      projectionOnly: true,
      runtimeReceives: "derived_projection_only",
      bpmnForbidden: true,
    }),
    revision: workflow.revision ?? 1,
  });
}

export default createWorkflowProjectionFromBusinessWorkflow;

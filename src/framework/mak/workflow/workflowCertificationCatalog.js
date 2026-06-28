/**
 * Catálogo de certificação V20 — Workflow Configuration Engine.
 */
export const MAK_WORKFLOW_CERTIFICATION_CATALOG = Object.freeze([
  { id: "wf_nome", name: "wf_nome", label: "Nome", type: "text" },
  { id: "wf_state", name: "wf_state", label: "Estado", type: "text", readOnly: true },
  { id: "wf_total", name: "wf_total", label: "Total", type: "number", readOnly: true,
    formula: {
      dependsOn: ["wf_valor_a", "wf_valor_b"],
      expression: { fn: "sum", args: ["wf_valor_a", "wf_valor_b"] },
    },
  },
  { id: "wf_valor_a", name: "wf_valor_a", label: "Valor A", type: "number" },
  { id: "wf_valor_b", name: "wf_valor_b", label: "Valor B", type: "number" },
  { id: "wf_motivo", name: "wf_motivo", label: "Motivo", type: "text" },
]);

export const MAK_WORKFLOW_CERTIFICATION_LAYOUT = Object.freeze({
  principais: MAK_WORKFLOW_CERTIFICATION_CATALOG.map((field) => field.id),
});

export const MAK_WORKFLOW_CERTIFICATION_DEFINITIONS = Object.freeze([
  {
    id: "wf-create",
    start: "draft",
    finish: ["completed"],
    states: {
      draft: { label: "Rascunho", status: "draft" },
      validating: { label: "Validando", status: "validating" },
      completed: { label: "Concluído", status: "completed" },
      cancelled: { label: "Cancelado", status: "cancelled" },
    },
    onStart: [
      { action: "setField", field: "wf_state", value: "draft" },
      { action: "log", message: "[workflowcert] workflow create started" },
    ],
    transitions: [
      {
        id: "t-submit",
        from: "draft",
        trigger: "submit",
        to: "validating",
        before: [{ type: "validate" }],
        steps: [
          { type: "formula" },
          { action: "setField", field: "wf_state", value: "validating" },
          { action: "dispatch", suffix: "workflow-validating" },
        ],
      },
      {
        id: "t-complete",
        from: "validating",
        trigger: "complete",
        to: "completed",
        when: { field: "wf_nome", notEmpty: true },
        steps: [
          { action: "save" },
          { action: "setField", field: "wf_state", value: "completed" },
          { type: "finish" },
        ],
      },
      {
        id: "t-cancel",
        from: "draft",
        trigger: "cancel",
        to: "cancelled",
        steps: [
          { action: "setField", field: "wf_state", value: "cancelled" },
          { action: "dispatch", suffix: "workflow-cancelled" },
        ],
      },
    ],
  },
  {
    id: "wf-approval",
    start: "pending",
    finish: ["approved", "rejected"],
    states: {
      pending: { label: "Pendente", status: "pending" },
      approved: { label: "Aprovado", status: "approved" },
      rejected: { label: "Reprovado", status: "rejected" },
    },
    transitions: [
      {
        id: "t-approve",
        from: "pending",
        trigger: "approve",
        to: "approved",
        steps: [
          { type: "approval" },
          { action: "setField", field: "wf_state", value: "approved" },
          { type: "notification", suffix: "workflow-approved" },
        ],
      },
      {
        id: "t-reject",
        from: "pending",
        trigger: "reject",
        to: "rejected",
        steps: [
          { type: "rejection" },
          { action: "setField", field: "wf_state", value: "rejected" },
          { type: "notification", suffix: "workflow-rejected" },
        ],
      },
    ],
  },
  {
    id: "wf-parallel",
    start: "draft",
    finish: ["done"],
    states: {
      draft: { label: "Draft" },
      done: { label: "Done" },
    },
    transitions: [
      {
        id: "t-parallel",
        from: "draft",
        trigger: "process",
        to: "done",
        parallel: true,
        steps: [
          { action: "setField", field: "wf_motivo", value: "parallel-a" },
          { action: "dispatch", suffix: "workflow-parallel-a" },
          { action: "dispatch", suffix: "workflow-parallel-b" },
        ],
      },
    ],
  },
  {
    id: "wf-rollback",
    start: "draft",
    finish: ["done", "rolled-back"],
    states: {
      draft: { label: "Draft" },
      done: { label: "Done" },
      "rolled-back": { label: "Rollback" },
    },
    transitions: [
      {
        id: "t-risky",
        from: "draft",
        trigger: "risky",
        to: "done",
        rollback: [{ action: "setField", field: "wf_state", value: "rolled-back" }],
        steps: [
          { action: "setField", field: "wf_state", value: "processing" },
          { action: "executeCallback", name: "__forceActionFailure" },
        ],
      },
    ],
  },
]);

export const MAK_WORKFLOW_CERTIFICATION_EVENT_DEFINITIONS = Object.freeze([
  {
    id: "wf-onLoad-start",
    event: "onLoad",
    priority: 100,
    handlers: [{ action: "runWorkflow", workflowId: "wf-create", trigger: "start" }],
  },
]);

export default MAK_WORKFLOW_CERTIFICATION_DEFINITIONS;

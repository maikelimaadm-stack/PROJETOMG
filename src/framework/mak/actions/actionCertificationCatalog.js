/**
 * Catálogo de certificação V19 — Actions Configuration Engine.
 */
export const MAK_ACTION_CERTIFICATION_CATALOG = Object.freeze([
  { id: "act_nome", name: "act_nome", label: "Nome", type: "text" },
  { id: "act_status", name: "act_status", label: "Status", type: "text", readOnly: true },
  { id: "act_api_result", name: "act_api_result", label: "Resultado API", type: "text", readOnly: true },
  { id: "act_contador", name: "act_contador", label: "Contador", type: "number", readOnly: true },
  { id: "act_flag", name: "act_flag", label: "Flag condicional", type: "text" },
]);

export const MAK_ACTION_CERTIFICATION_LAYOUT = Object.freeze({
  principais: MAK_ACTION_CERTIFICATION_CATALOG.map((field) => field.id),
});

export const MAK_ACTION_CERTIFICATION_DEFINITIONS = Object.freeze([
  {
    id: "act-save-flow",
    action: "sequence",
    priority: 100,
    actions: [
      { action: "validate" },
      { action: "calculateFormula" },
      { action: "save" },
      { action: "dispatch", suffix: "action-save-complete" },
    ],
  },
  {
    id: "act-duplicate-flow",
    action: "sequence",
    actions: [
      { action: "duplicate" },
      { action: "setField", field: "act_status", value: "duplicado" },
      { action: "log", message: "[actionscert] duplicate" },
    ],
  },
  {
    id: "act-update-fields",
    action: "setFields",
    fields: [
      { field: "act_status", value: "atualizado" },
      { field: "act_flag", value: "multi-update" },
    ],
  },
  {
    id: "act-open-layout-dialog",
    action: "openDialog",
    dialogId: "layout-config",
  },
  {
    id: "act-close-layout-dialog",
    action: "closeDialog",
    dialogId: "layout-config",
  },
  {
    id: "act-execute-api-mock",
    action: "executeApi",
    mock: true,
    method: "GET",
    url: "/api/actionscert/ping",
    target: "act_api_result",
    response: { ok: true, source: "actionscert-mock" },
  },
  {
    id: "act-multi-sequence",
    action: "sequence",
    actions: [
      { action: "runAction", actionId: "act-update-fields" },
      { action: "runAction", actionId: "act-execute-api-mock" },
      { action: "dispatch", suffix: "multi-actions-complete" },
    ],
  },
  {
    id: "act-conditional",
    action: "when",
    when: { field: "act_flag", notEquals: "" },
    then: [
      { action: "setField", field: "act_status", value: "condicao-ativa" },
    ],
    else: [
      { action: "setField", field: "act_status", value: "condicao-inativa" },
    ],
  },
  {
    id: "act-parallel-demo",
    action: "parallel",
    actions: [
      { action: "setField", field: "act_contador", value: 1 },
      { action: "dispatch", suffix: "parallel-a" },
      { action: "dispatch", suffix: "parallel-b" },
    ],
  },
  {
    id: "act-rollback-demo",
    action: "sequence",
    rollback: [{ action: "setField", field: "act_status", value: "rollback-aplicado" }],
    actions: [
      { action: "setField", field: "act_status", value: "transacao-iniciada" },
      {
        action: "when",
        when: { field: "act_nome", notEmpty: true },
        then: [{ action: "executeCallback", name: "__forceActionFailure" }],
      },
    ],
  },
]);

export const MAK_ACTION_CERTIFICATION_EVENT_DEFINITIONS = Object.freeze([
  {
    id: "act-onLoad-run-sequence",
    event: "onLoad",
    priority: 50,
    handlers: [{ action: "runAction", actionId: "act-update-fields" }],
  },
  {
    id: "act-onChange-increment",
    event: "onChange",
    field: "act_nome",
    handlers: [
      {
        action: "computeField",
        field: "act_contador",
        expression: {
          fn: "sum",
          args: [{ fn: "coalesce", args: ["act_contador", 0] }, 1],
        },
      },
    ],
  },
]);

export default MAK_ACTION_CERTIFICATION_DEFINITIONS;

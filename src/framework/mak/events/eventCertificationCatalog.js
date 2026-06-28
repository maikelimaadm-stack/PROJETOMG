/**
 * Catálogo de certificação V18 — Events Configuration Engine.
 */
export const MAK_EVENT_CERTIFICATION_CATALOG = Object.freeze([
  {
    id: "evt_nome",
    name: "evt_nome",
    label: "Nome",
    type: "text",
  },
  {
    id: "evt_status",
    name: "evt_status",
    label: "Status",
    type: "text",
    readOnly: true,
  },
  {
    id: "evt_contador",
    name: "evt_contador",
    label: "Contador onChange",
    type: "number",
    readOnly: true,
  },
  {
    id: "evt_total",
    name: "evt_total",
    label: "Total (fórmula)",
    type: "number",
    readOnly: true,
    formula: {
      dependsOn: ["evt_valor_a", "evt_valor_b"],
      expression: { fn: "sum", args: ["evt_valor_a", "evt_valor_b"] },
    },
  },
  {
    id: "evt_valor_a",
    name: "evt_valor_a",
    label: "Valor A",
    type: "number",
  },
  {
    id: "evt_valor_b",
    name: "evt_valor_b",
    label: "Valor B",
    type: "number",
  },
]);

export const MAK_EVENT_CERTIFICATION_LAYOUT = Object.freeze({
  principais: MAK_EVENT_CERTIFICATION_CATALOG.map((field) => field.id),
});

export const MAK_EVENT_CERTIFICATION_DEFINITIONS = Object.freeze([
  {
    id: "evt-onLoad-defaults",
    event: "onLoad",
    priority: 100,
    handlers: [
      {
        action: "setField",
        field: "evt_status",
        value: "carregado",
      },
      {
        action: "dispatch",
        suffix: "form-loaded",
        payload: { source: "eventscert" },
      },
      {
        action: "log",
        level: "info",
        message: "[eventscert] onLoad",
      },
    ],
  },
  {
    id: "evt-onChange-increment",
    event: "onChange",
    field: "evt_nome",
    priority: 50,
    handlers: [
      {
        action: "computeField",
        field: "evt_contador",
        expression: {
          fn: "sum",
          args: [{ fn: "coalesce", args: ["evt_contador", 0] }, 1],
        },
      },
      {
        action: "dispatch",
        suffix: "field-changed",
        payload: { field: "evt_nome" },
      },
    ],
  },
  {
    id: "evt-onBeforeSave-guard",
    event: "onBeforeSave",
    priority: 100,
    when: { field: "evt_nome", empty: true },
    handlers: [{ action: "preventDefault" }],
  },
  {
    id: "evt-onSave-dispatch",
    event: "onSave",
    priority: 10,
    handlers: [
      {
        action: "dispatch",
        suffix: "record-saved",
      },
      {
        action: "log",
        level: "info",
        message: "[eventscert] onSave",
      },
    ],
  },
  {
    id: "evt-onDelete-dispatch",
    event: "onDelete",
    priority: 10,
    handlers: [
      {
        action: "dispatch",
        suffix: "record-deleted",
      },
    ],
  },
  {
    id: "evt-onFormulaCalculated",
    event: "onFormulaCalculated",
    priority: 10,
    handlers: [
      {
        action: "log",
        level: "info",
        message: "[eventscert] onFormulaCalculated",
      },
    ],
  },
  {
    id: "evt-onValidationCompleted",
    event: "onValidationCompleted",
    priority: 10,
    handlers: [
      {
        action: "dispatch",
        suffix: "validation-completed",
      },
    ],
  },
]);

export default MAK_EVENT_CERTIFICATION_DEFINITIONS;

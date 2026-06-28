import {
  MAK_FORM_INPUT_CLASS,
  buildModeloBase1FormDefaultConfig,
} from "@/ModeloBase1/layout/modeloBase1VisualTokens.js";

export const __KEY_PREFIX_UPPER___FORM_BASE_PANELS = [{ id: "principais", label: "Principais" }];

export const __KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT = {
  principais: ["codigo", "nome", "status", "observacoes"],
};

export const __KEY_PREFIX_UPPER___REQUIRED_FIELDS = ["nome"];
export const __KEY_PREFIX_UPPER___UPPER_FIELDS = ["nome", "observacoes"];
export const __KEY_PREFIX_UPPER___NATIVE_FIELDS = new Set(["codigo", "nome", "status", "observacoes"]);

export const __KEY_PREFIX_UPPER___FORM_FIELD_DEFS = [
  { id: "codigo", name: "codigo", label: "Código", autoCode: true },
  {
    id: "nome",
    name: "nome",
    label: "Nome",
    required: true,
    uppercase: true,
    validation: { required: true, minLength: 1, messages: { required: "Nome é obrigatório." } },
  },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: "select",
    options: ["Ativo", "Inativo"],
  },
  { id: "observacoes", name: "observacoes", label: "Observações", type: "textarea", uppercase: true },
  {
    id: "nome_normalizado",
    name: "nome_normalizado",
    label: "Nome normalizado",
    type: "text",
    readOnly: true,
    hidden: true,
    formula: {
      dependsOn: ["nome"],
      expression: { fn: "uppercase", args: ["nome"] },
    },
  },
];

export const __KEY_PREFIX_UPPER___EVENT_DEFINITIONS = [
  {
    id: "__KEY_PREFIX__-onLoad",
    event: "onLoad",
    priority: 10,
    handlers: [
      {
        action: "log",
        level: "info",
        message: "[__MODULE_ID__] formulário carregado",
      },
    ],
  },
];

export const __KEY_PREFIX_UPPER___COLUNAS_BASE = [
  { id: "codigo", label: "Código", default: true, sortable: true, width: 100 },
  { id: "nome", label: "Nome", default: true, sortable: true, width: 280 },
  { id: "status", label: "Status", default: true, sortable: true, width: 120 },
  { id: "observacoes", label: "Observações", default: false, sortable: false, width: 240 },
];

export const buildEmpty__MODULE_ID_PASCAL__Form = () => ({
  nome: "",
  status: "Ativo",
  observacoes: "",
});

export const build__KEY_PREFIX_PASCAL__FormDefaultConfig = () =>
  buildModeloBase1FormDefaultConfig({
    panels: __KEY_PREFIX_UPPER___FORM_BASE_PANELS,
    layout: __KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT,
  });

export const inputClass = MAK_FORM_INPUT_CLASS;

export const applyDuplicateFieldClears = (data) => ({
  ...data,
  codigo: undefined,
  id: undefined,
});

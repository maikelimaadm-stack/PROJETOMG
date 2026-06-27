export const MAR_FORM_BASE_PANELS = [{ id: "principais", label: "Principais" }];

export const MAR_FORM_DEFAULT_LAYOUT = {
  principais: ["codigo", "nome", "status", "observacoes"],
};

export const MAR_REQUIRED_FIELDS = ["nome"];
export const MAR_UPPER_FIELDS = ["nome", "observacoes"];
export const MAR_NATIVE_FIELDS = new Set(["codigo", "nome", "status", "observacoes"]);

export const MAR_COLUNAS_BASE = [
  { id: "codigo", label: "Código", default: true, sortable: true, width: 100 },
  { id: "nome", label: "Nome", default: true, sortable: true, width: 280 },
  { id: "status", label: "Status", default: true, sortable: true, width: 120 },
  { id: "observacoes", label: "Observações", default: false, sortable: false, width: 240 },
];

export const buildEmptyMarcaForm = () => ({
  nome: "",
  status: "Ativo",
  observacoes: "",
});

export const buildMarFormDefaultConfig = () => ({
  version: 3,
  panels: MAR_FORM_BASE_PANELS.map((panel) => ({ ...panel })),
  layout: { ...MAR_FORM_DEFAULT_LAYOUT },
});

export const inputClass =
  "border-0 shadow-none focus-visible:ring-0 bg-white w-full";

export const applyDuplicateFieldClears = (data) => ({
  ...data,
  codigo: undefined,
  id: undefined,
});

export const MAR_FORM_FIELD_DEFS = [
  { id: "codigo", name: "codigo", label: "Código", autoCode: true },
  { id: "nome", name: "nome", label: "Nome", required: true, uppercase: true },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: "select",
    options: ["Ativo", "Inativo"],
  },
  { id: "observacoes", name: "observacoes", label: "Observações", type: "textarea", uppercase: true },
];

export const __KEY_PREFIX_UPPER___FORM_BASE_PANELS = [{ id: "principais", label: "Principais" }];

export const __KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT = {
  principais: ["codigo", "nome", "status", "observacoes"],
};

export const __KEY_PREFIX_UPPER___REQUIRED_FIELDS = ["nome"];
export const __KEY_PREFIX_UPPER___UPPER_FIELDS = ["nome", "observacoes"];
export const __KEY_PREFIX_UPPER___NATIVE_FIELDS = new Set(["codigo", "nome", "status", "observacoes"]);

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

export const build__KEY_PREFIX_PASCAL__FormDefaultConfig = () => ({
  version: 3,
  panels: __KEY_PREFIX_UPPER___FORM_BASE_PANELS.map((panel) => ({ ...panel })),
  layout: { ...__KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT },
});

export const inputClass =
  "border-0 shadow-none focus-visible:ring-0 bg-white w-full";

export const applyDuplicateFieldClears = (data) => ({
  ...data,
  codigo: undefined,
  id: undefined,
});

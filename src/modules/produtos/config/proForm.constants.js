export const PRO_FORM_BASE_PANELS = [{ id: "principais", label: "Principais" }];

export const PRO_FORM_DEFAULT_LAYOUT = {
  principais: ["codigo", "nome", "status", "preco", "descricao"],
};

export const PRO_REQUIRED_FIELDS = ["nome"];
export const PRO_UPPER_FIELDS = ["nome", "descricao"];
export const PRO_NATIVE_FIELDS = new Set(["codigo", "nome", "status", "preco", "descricao"]);

export const PRO_COLUNAS_BASE = [
  { id: "codigo", label: "Código", default: true, sortable: true, width: 100 },
  { id: "nome", label: "Nome", default: true, sortable: true, width: 280 },
  { id: "status", label: "Status", default: true, sortable: true, width: 120 },
  { id: "preco", label: "Preço", default: true, sortable: true, width: 120 },
  { id: "descricao", label: "Descrição", default: false, sortable: false, width: 240 },
];

export const buildEmptyProdutoForm = () => ({
  nome: "",
  status: "Ativo",
  preco: null,
  descricao: "",
});

export const buildProFormDefaultConfig = () => ({
  version: 3,
  panels: PRO_FORM_BASE_PANELS.map((panel) => ({ ...panel })),
  layout: { ...PRO_FORM_DEFAULT_LAYOUT },
});

export const inputClass =
  "border-0 shadow-none focus-visible:ring-0 bg-white w-full";

export const applyDuplicateFieldClears = (data) => ({
  ...data,
  codigo: undefined,
  id: undefined,
});

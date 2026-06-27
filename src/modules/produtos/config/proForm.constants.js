import {
  MAK_FORM_INPUT_CLASS,
  buildModeloBase1FormDefaultConfig,
} from "@/ModeloBase1/layout/modeloBase1VisualTokens.js";

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

export const buildProFormDefaultConfig = () =>
  buildModeloBase1FormDefaultConfig({
    panels: PRO_FORM_BASE_PANELS,
    layout: PRO_FORM_DEFAULT_LAYOUT,
  });

export const inputClass = MAK_FORM_INPUT_CLASS;

export const applyDuplicateFieldClears = (data) => ({
  ...data,
  codigo: undefined,
  id: undefined,
});

export const PRO_FORM_FIELD_DEFS = [
  { id: "codigo", name: "codigo", label: "Código", autoCode: true },
  { id: "nome", name: "nome", label: "Nome", required: true, uppercase: true },
  {
    id: "status",
    name: "status",
    label: "Status",
    type: "select",
    options: ["Ativo", "Inativo"],
  },
  { id: "preco", name: "preco", label: "Preço", type: "number" },
  { id: "descricao", name: "descricao", label: "Descrição", type: "textarea", uppercase: true },
];

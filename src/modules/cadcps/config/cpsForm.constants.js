import { CADCPS_APLICACAO } from "@/modules/cadcps/config/cadcpsConstants.js";
import {
  MAK_FORM_INPUT_CLASS,
  MAK_FORM_INPUT_CLASS_GRID,
  buildModeloBase1FormDefaultConfig,
} from "@/ModeloBase1/layout/modeloBase1VisualTokens.js";

export const CPS_FORM_BASE_PANELS = [
  { id: "principais", label: "Principais" },
  { id: "aplicacao", label: "Aplicação" },
  { id: "configuracoes", label: "Configurações gerais" },
  { id: "tipo", label: "Tipo e opções" },
];

export const CPS_FORM_DEFAULT_LAYOUT = {
  principais: ["codigo", "tela_id", "nome", "field_name", "tipo", "ativo"],
  aplicacao: ["aplicacao_modo", "empresa_ids"],
  configuracoes: [
    "placeholder",
    "descricao",
    "obrigatorio",
    "read_only",
    "visivel_form",
    "visivel_tabela",
    "visivel_relatorio",
    "pesquisavel",
    "filtravel",
    "exportavel",
    "auditavel",
  ],
  tipo: [
    "decimal_places",
    "separador_decimal",
    "separador_milhar",
    "usar_mascara",
    "mascaras_text",
    "opcoesDraft",
    "relation_entity",
    "calculation_builder",
  ],
};

export const CPS_REQUIRED_FIELDS = ["nome", "tela_id", "tipo"];
export const CPS_UPPER_FIELDS = ["nome", "field_name", "descricao", "placeholder"];
export const CPS_NATIVE_FIELDS = new Set([
  "codigo",
  "tela_id",
  "nome",
  "field_name",
  "tipo",
  "ativo",
  "aplicacao_modo",
  "empresa_ids",
  "placeholder",
  "descricao",
  "obrigatorio",
  "read_only",
  "visivel_form",
  "visivel_tabela",
  "visivel_relatorio",
  "pesquisavel",
  "filtravel",
  "exportavel",
  "auditavel",
  "decimal_places",
  "separador_decimal",
  "separador_milhar",
  "usar_mascara",
  "mascaras_text",
  "opcoesDraft",
  "relation_entity",
  "calculation_builder",
]);

export const CPS_COLUNAS_BASE = [
  { id: "id_global", label: "ID Global", default: true, sortable: true, align: "right", width: 90 },
  { id: "codigo", label: "Código", default: true, sortable: true, align: "right", width: 90 },
  { id: "nome", label: "Nome do Campo", default: true, sortable: true, align: "left", width: 260 },
  { id: "tipo", label: "Tipo", default: true, sortable: true, align: "left", width: 140 },
  { id: "telas", label: "Tela", default: true, sortable: false, align: "left", width: 200 },
  { id: "aplicacao", label: "Aplicação", default: true, sortable: true, align: "left", width: 160 },
  { id: "quantidade_empresas", label: "Qtd. Empresas", default: true, sortable: true, align: "right", width: 120 },
  { id: "obrigatorio", label: "Obrigatório", default: true, sortable: true, align: "center", width: 100 },
  { id: "ativo", label: "Ativo", default: true, sortable: true, align: "center", width: 80 },
  { id: "createdAt", label: "Criado Em", default: true, sortable: true, align: "center", width: 150 },
  { id: "updatedAt", label: "Atualizado Em", default: true, sortable: true, align: "center", width: 150 },
];

export const CPS_INPUT_CLASS = MAK_FORM_INPUT_CLASS_GRID;

export const inputClass = MAK_FORM_INPUT_CLASS;

export const buildEmptyCadcpsForm = () => ({
  nome: "",
  field_name: "",
  descricao: "",
  ativo: true,
  tipo: "texto",
  tela_id: "",
  aplicacao_modo: CADCPS_APLICACAO.TODAS,
  empresa_ids: [],
  obrigatorio: false,
  read_only: false,
  visivel_form: true,
  visivel_tabela: false,
  visivel_relatorio: false,
  pesquisavel: true,
  filtravel: true,
  exportavel: true,
  auditavel: true,
  placeholder: "",
  formula: "",
  calculation_builder: { items: [{ field: "", operator: "*" }, { field: "", operator: "*" }] },
  usar_mascara: false,
  mascaras_text: "",
  usar_decimal: false,
  decimal_places: 2,
  separador_decimal: ",",
  separador_milhar: ".",
  relation_entity: "",
  opcoes: [],
  opcoesDraft: "",
});

export const buildCpsFormDefaultConfig = () =>
  buildModeloBase1FormDefaultConfig({
    panels: CPS_FORM_BASE_PANELS,
    layout: CPS_FORM_DEFAULT_LAYOUT,
  });

export const applyDuplicateFieldClears = (data) => ({
  ...data,
  codigo: undefined,
  id: undefined,
  field_name: "",
});

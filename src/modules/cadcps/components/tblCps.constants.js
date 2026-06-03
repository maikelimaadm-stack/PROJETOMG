export const FILTER_POPOVER_WIDTH = 272;
export const FILTER_ICON_CLASS = "w-3 h-3 shrink-0";

export const COLUNAS_BASE = [
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

export const WIDTHS_KEY = "cps_col_widths";
export const FROZEN_KEY = "cps_col_frozen";
export const VISIBLE_KEY = "cps_col_visiveis";
export const ORDER_KEY = "cps_col_ordem";
export const AGGR_KEY = "cps_table_aggregation_config";
export const PAGE_SIZE_KEY = "cps_table_page_size";
export const ROW_DBLCLICK_OPEN_MS = 260;
export const ROW_DBLCLICK_PAIR_MS = 500;
export const MIN_COL_WIDTH = 80;
export const MAX_AUTO_FIT_WIDTH = 520;
export const AUTO_FIT_MEASURE_LIMIT = 300;

export const getMinWidth = (col) =>
  Math.max(MIN_COL_WIDTH, String(col?.label || "").length * 7 + 18);

export const formatDateValue = (value) => {
  if (!value) return "-";
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return "-";
  return parsed.toLocaleString("pt-BR");
};

export const formatHeaderLabel = (col) => String(col?.label || "");

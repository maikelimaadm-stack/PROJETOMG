export const FILTER_POPOVER_WIDTH = 272;
export const FILTER_ICON_CLASS = "w-3 h-3 shrink-0";

export const COLUNAS_BASE = [
  { id: "id_global", label: "ID Global", default: true, sortable: true, align: "right", width: 90 },
  { id: "codempresa", label: "Cód. Empresa", default: true, sortable: true, align: "right", width: 90 },
  { id: "razao_social", label: "Nome/Razão Social Emp.", default: true, sortable: true, align: "left", width: 260 },
  { id: "nome_fantasia", label: "Nome fantasia", default: true, sortable: true, align: "left", width: 220 },
  { id: "tipo_pessoa", label: "Tipo", default: true, sortable: true, align: "left", width: 80 },
  { id: "tipo_vinculo", label: "Vínculo", default: true, sortable: true, align: "left", width: 120 },
  { id: "cpf_cnpj", label: "CPF/CNPJ", default: true, sortable: true, align: "left", width: 160 },
  {
    id: "inscricao_estadual",
    label: "Inscrição Estadual",
    default: true,
    sortable: true,
    align: "left",
    width: 170,
  },
  { id: "telefone", label: "Telefone", default: true, sortable: true, align: "left", width: 130 },
  { id: "whatsapp", label: "WhatsApp", default: true, sortable: true, align: "left", width: 140 },
  { id: "email", label: "E-mail", default: true, sortable: true, align: "left", width: 200 },
  { id: "logo_url", label: "Logo", default: true, sortable: false, align: "left", width: 180 },
  { id: "cep", label: "CEP", default: true, sortable: true, align: "left", width: 110 },
  { id: "endereco", label: "Endereço", default: true, sortable: true, align: "left", width: 240 },
  { id: "numero", label: "Número", default: true, sortable: true, align: "left", width: 100 },
  { id: "bairro", label: "Bairro", default: true, sortable: true, align: "left", width: 150 },
  { id: "cidade", label: "Cidade", default: true, sortable: true, align: "left", width: 150 },
  { id: "estado", label: "UF", default: true, sortable: true, align: "left", width: 70 },
  { id: "observacoes", label: "Observações", default: true, sortable: true, align: "left", width: 260 },
  { id: "status", label: "Status", default: true, sortable: true, align: "left", width: 90 },
];

export const WIDTHS_KEY = "emp_col_widths";
export const FROZEN_KEY = "emp_col_frozen";
export const PINNED_RIGHT_KEY = "emp_col_pinned_right";
export const VISIBLE_KEY = "emp_col_visiveis";
export const ORDER_KEY = "emp_col_ordem";
export const AGGR_KEY = "emp_table_aggregation_config";
export const PAGE_SIZE_KEY = "emp_table_page_size";
export const FILTERS_KEY = "emp_col_filters_v2";
export const GROUP_BY_KEY = "emp_group_by_columns_v1";
export const SORT_KEY = "emp_sort_columns_v1";
export const ROW_DBLCLICK_OPEN_MS = 260;
export const ROW_DBLCLICK_PAIR_MS = 500;
export const MIN_COL_WIDTH = 80;
export const MAX_AUTO_FIT_WIDTH = 520;
export const AUTO_FIT_MEASURE_LIMIT = 300;

/** Espaço reservado no cabeçalho para texto + ícones (px). */
export const HEADER_PADDING_X = 74;
export const HEADER_LABEL_MIN_CH = 5;
export const HEADER_LABEL_CHAR_PX = 7;

export const getMinWidth = (col) => {
  const label = String(col?.label || "");
  const labelChars = Math.max(HEADER_LABEL_MIN_CH, label.length);
  const labelWidth = labelChars * HEADER_LABEL_CHAR_PX;
  return Math.max(MIN_COL_WIDTH, Math.ceil(labelWidth + HEADER_PADDING_X));
};

export const formatDateValue = (value) => {
  if (!value) return "-";
  const [ano, mes, dia] = String(value).split("T")[0].split("-");
  return !ano || !mes || !dia ? "-" : `${dia}/${mes}/${ano}`;
};

export const formatHeaderLabel = (col) => {
  const label = String(col?.label || "");
  if (col?.id === "custom:valor" || label.toUpperCase() === "VALOR") return "VALOR";
  return label;
};


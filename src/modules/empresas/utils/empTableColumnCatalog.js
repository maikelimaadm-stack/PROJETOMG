import campoEngine from "@/framework/cadastro/fields/campoEngine";
import {
  loadColumnOrder,
  loadVisibleColumns,
} from "@/framework/cadastro/tables/empColumnLayout";
import {
  AGGR_KEY,
  COLUNAS_BASE,
  ORDER_KEY,
  VISIBLE_KEY,
} from "@/modules/empresas/components/tblEmp.constants";

export const loadLayoutAggregationConfig = () => {
  try {
    const saved = localStorage.getItem(AGGR_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch {
    return {};
  }
};

/** Mesma origem de colunas da tabela (base + personalizadas visíveis na tabela). */
export const buildColunasDisponiveis = (
  camposPersonalizados = [],
  layoutAggregationConfig = loadLayoutAggregationConfig()
) => {
  const dinamicas = camposPersonalizados
    .map((campo) => campoEngine.normalize(campo))
    .filter((campo) => campo?.ativo !== false && campo.visivel_tabela === true)
    .map((campo) => ({
      ...campo,
      id: `custom:${campo.field_name}`,
      label: campo.label,
      default: false,
      sortable: campo.ordenavel !== false,
      filtravel: campo.filtravel !== false,
      align:
        campo.tipo === "date"
          ? "center"
          : campo.tipo === "number" || campo.tipo === "calculado"
            ? "right"
            : "left",
      width: campo.largura_coluna || 160,
      ordem_tabela: campo.ordem_tabela ?? campo.ordem ?? 999,
      customField: campo.field_name,
    }));

  const aggByCol = { ...layoutAggregationConfig };

  return [
    ...COLUNAS_BASE,
    ...dinamicas.sort((a, b) => (a.ordem_tabela || 999) - (b.ordem_tabela || 999)),
  ].map((col) => {
    const cfg = aggByCol[col.id];
    if (cfg?.enabled) {
      return {
        ...col,
        agregacao_tipo: cfg.type,
        agregacao: cfg.type,
        usar_decimal: col.usar_decimal ?? true,
        decimal_places: col.decimal_places ?? 2,
      };
    }
    return { ...col, agregacao_tipo: "", agregacao: "" };
  });
};

/** Mesma regra da TBLEMP / dialog de colunas: visíveis na ordem salva. */
export const resolveColumnsInUse = (disponiveis = [], ordem = [], visiveis = []) =>
  ordem
    .map((id) => disponiveis.find((col) => col.id === id))
    .filter((col) => col && visiveis.includes(col.id));

/** Sincroniza visibilidade/ordem quando entram colunas novas, sem alterar a ordem salva. */
export const mergeEffectiveColumnLayout = (disponiveis = [], savedOrdem = [], savedVisiveis = []) => {
  const defaultVisible = disponiveis.filter((col) => col.default).map((col) => col.id);
  const visiveis = Array.from(new Set([...savedVisiveis, ...defaultVisible]));
  const ordem = savedOrdem;
  return { ordem, visiveis, inUse: resolveColumnsInUse(disponiveis, ordem, visiveis) };
};

/** Colunas em uso na configuração da tabela (fallback via localStorage). */
export const getColumnsInUse = (camposPersonalizados = []) => {
  const disponiveis = buildColunasDisponiveis(camposPersonalizados);
  const ordem = loadColumnOrder(ORDER_KEY, disponiveis);
  const visiveis = loadVisibleColumns(VISIBLE_KEY, disponiveis);
  const inUse = resolveColumnsInUse(disponiveis, ordem, visiveis);
  return { disponiveis, ordem, visiveis, inUse };
};

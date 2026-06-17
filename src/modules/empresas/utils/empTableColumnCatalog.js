import campoEngine from "@/framework/cadastro/fields/campoEngine";
import {
  loadColumnOrder,
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
      default: true,
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

export const loadSavedVisibleColumns = (storageKey) => {
  try {
    const saved = localStorage.getItem(storageKey);
    if (!saved) return null;
    const parsed = JSON.parse(saved);
    return Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
};

/** Respeita colunas ocultas pelo usuário; só inclui defaults para colunas novas no catálogo. */
export const resolveEffectiveVisibleColumns = (
  disponiveis = [],
  savedVisiveis = null,
  savedOrdem = null
) => {
  const baseIds = new Set(disponiveis.map((col) => col.id));
  const defaults = disponiveis.filter((col) => col.default).map((col) => col.id);

  if (!Array.isArray(savedVisiveis)) {
    return defaults;
  }

  const persisted = savedVisiveis.filter((id) => baseIds.has(id));
  if (persisted.length === 0) {
    return defaults;
  }

  const knownIds = new Set(
    Array.isArray(savedOrdem)
      ? savedOrdem.filter((id) => baseIds.has(id))
      : persisted
  );
  const novos = disponiveis
    .filter((col) => !knownIds.has(col.id) && col.default)
    .map((col) => col.id);

  return [...persisted, ...novos];
};

/** Sincroniza visibilidade/ordem quando entram colunas novas, sem reexibir colunas ocultas pelo usuário. */
export const mergeEffectiveColumnLayout = (disponiveis = [], savedOrdem = [], savedVisiveis = []) => {
  const visiveis = resolveEffectiveVisibleColumns(disponiveis, savedVisiveis, savedOrdem);
  const ordem = savedOrdem;
  return { ordem, visiveis, inUse: resolveColumnsInUse(disponiveis, ordem, visiveis) };
};

/** Colunas em uso na configuração da tabela (fallback via localStorage). */
export const getColumnsInUse = (camposPersonalizados = []) => {
  const disponiveis = buildColunasDisponiveis(camposPersonalizados);
  const ordem = loadColumnOrder(ORDER_KEY, disponiveis);
  const savedVisiveis = loadSavedVisibleColumns(VISIBLE_KEY);
  const visiveis = resolveEffectiveVisibleColumns(disponiveis, savedVisiveis, ordem);
  const inUse = resolveColumnsInUse(disponiveis, ordem, visiveis);
  return { disponiveis, ordem, visiveis, inUse };
};

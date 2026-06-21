import campoEngine from "@/framework/cadastro/fields/campoEngine";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import { evaluateErpFilter, isErpFilterActive, normalizePanelFilterValue, resolveErpFilterMeta } from "@/shared/filters";
import {
  buildMgFilterFields,
  MG_FILTER_STATUS_FIELD,
  MG_FILTER_SIDEBAR_FIELDS,
} from "@/modules/empresas/layout/mgFilterFields";

export const MG_PANEL_FILTER_FIELDS = [...MG_FILTER_SIDEBAR_FIELDS, MG_FILTER_STATUS_FIELD];

export function getEmpresaPanelFieldValue(emp, field) {
  if (!emp || !field) return "-";
  const columnId = field.column || field.key;

  if (columnId === "id_global") return emp.id_global ? formatIdGlobal(emp.id_global) : "-";
  if (columnId === "codempresa") return emp.codempresa ?? "-";
  if (columnId === "tipo_vinculo") {
    if (emp.tipo_vinculo === "proprietario") return "PROPRIETÁRIO";
    if (emp.tipo_vinculo === "arrendatario") return "ARRENDATÁRIO";
    return "-";
  }
  if (columnId.startsWith("custom:")) {
    const col =
      field.campoMeta ||
      {
        id: columnId,
        field_name: field.customField || columnId.replace(/^custom:/, ""),
        customField: field.customField || columnId.replace(/^custom:/, ""),
      };
    return campoEngine.getValorCampo(emp, col, {});
  }

  const nativeValue = emp[columnId];
  if (nativeValue != null && String(nativeValue).trim() !== "") {
    return String(nativeValue);
  }
  return "-";
}

/** @deprecated use getEmpresaPanelFieldValue */
export function getPanelFilterFieldValue(emp, field) {
  return getEmpresaPanelFieldValue(emp, field);
}

export function empresaPassesOtherPanelFilters(emp, appliedValues = {}, excludeKey = null, filterFields = MG_PANEL_FILTER_FIELDS) {
  return filterFields.every((field) => {
    if (excludeKey && field.key === excludeKey) return true;
    const rawFilter = appliedValues[field.key];
    if (!isErpFilterActive(rawFilter)) return true;

    const filterMeta = resolveErpFilterMeta(field);
    const filter = normalizePanelFilterValue(rawFilter, filterMeta.filterType);
    const displayValue = getEmpresaPanelFieldValue(emp, field);
    const rawValue = displayValue === "-" ? "" : displayValue;

    return evaluateErpFilter({
      filter,
      filterType: filterMeta.filterType,
      rawValue,
      displayValue,
    });
  });
}

export function buildPanelFilterOptions(
  empresas = [],
  appliedValues = {},
  fieldKey,
  filterFields = MG_PANEL_FILTER_FIELDS
) {
  const field = filterFields.find((item) => item.key === fieldKey);
  if (!field) return [];

  const source = (Array.isArray(empresas) ? empresas : []).filter((emp) =>
    empresaPassesOtherPanelFilters(emp, appliedValues, fieldKey, filterFields)
  );

  return formatDistinctFilterItems(
    field,
    source
      .map((emp) => getEmpresaPanelFieldValue(emp, field))
      .filter((value) => value !== null && value !== undefined && String(value).trim() !== "" && value !== "-")
  );
}

const STATUS_DISTINCT_DISPLAY = {
  Ativa: "Ativo",
  Inativa: "Inativo",
  Ativo: "Ativo",
  Inativo: "Inativo",
};

/** Normaliza valores distintos da API para exibição/seleção nos filtros do painel. */
export function formatDistinctFilterItems(field, items = []) {
  if (!field) return [];
  const column = field.column || field.key;
  const unique = [
    ...new Set(
      (Array.isArray(items) ? items : [])
        .map((value) => (value == null ? "" : String(value).trim()))
        .filter(Boolean)
    ),
  ];

  let formatted = unique;
  if (column === "id_global" || field.key === "id_global") {
    formatted = unique
      .map((value) => {
        const numeric = Number(String(value).replace(/\./g, ""));
        return Number.isFinite(numeric) && numeric > 0 ? formatIdGlobal(numeric) : value;
      })
      .filter(Boolean);
  } else if (column === "status" || field.key === "status") {
    formatted = unique.map((value) => STATUS_DISTINCT_DISPLAY[value] || value);
  }

  return formatted.sort((a, b) =>
    String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" })
  );
}

export { buildMgFilterFields };

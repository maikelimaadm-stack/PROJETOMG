import campoEngine from "@/framework/cadastro/fields/campoEngine";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import { evaluateErpFilter, isErpFilterActive, normalizePanelFilterValue, resolveErpFilterMeta } from "@/shared/filters";
import { buildMgFilterFields } from "./mgFilterFields";

/** @deprecated passe filterFields via metadata — default vazio */
export const MG_PANEL_FILTER_FIELDS = [];

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

  return [
    ...new Set(
      source
        .map((emp) => getEmpresaPanelFieldValue(emp, field))
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== "" && value !== "-")
    ),
  ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
}

export { buildMgFilterFields };

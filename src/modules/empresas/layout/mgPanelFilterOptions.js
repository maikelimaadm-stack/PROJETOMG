import campoEngine from "@/framework/cadastro/fields/campoEngine";
import { formatIdGlobal } from "@/shared/utils/formatIdGlobal";
import { evaluateErpFilter, isErpFilterActive, normalizePanelFilterValue, resolveErpFilterMeta } from "@/shared/filters";
import {
  buildDistinctOptionsFromRecords,
  createPanelRecordPassesOrderKey,
  filterRecordsForFilterOptions,
} from "@/shared/filters/erpFilterApplyOrder";
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
  filterFields = MG_PANEL_FILTER_FIELDS,
  {
    filterApplyOrder = [],
    columnFilters = {},
    panelFilterColumnMap = {},
  } = {}
) {
  const field = filterFields.find((item) => item.key === fieldKey);
  if (!field) return [];

  const orderKey = fieldKey;

  const recordPassesOrderKey = createPanelRecordPassesOrderKey({
    appliedPanelValues: appliedValues,
    columnFilters,
    panelFilterColumnMap,
    filterFields,
    getEmpresaFieldValue: getEmpresaPanelFieldValue,
    evaluateColumnFilterRecord: (emp, columnMeta, draft) => {
      if (!columnMeta) return true;
      const columnId = columnMeta.id || columnMeta.column || columnMeta.key;
      const displayValue = getEmpresaPanelFieldValue(emp, { ...columnMeta, key: columnId, column: columnId });
      const rawValue = displayValue === "-" ? "" : displayValue;
      return evaluateErpFilter({
        filter: draft,
        filterType: draft?.type || resolveErpFilterMeta(columnMeta).filterType,
        rawValue,
        displayValue,
      });
    },
    getColumnMeta: (columnId) => filterFields.find((item) => item.column === columnId || item.key === columnId) || { id: columnId, column: columnId, key: columnId },
    getColumnFilterDraft: (columnId) => columnFilters?.[columnId],
  });

  const isOrderKeyActive = (key) => {
    if (key.startsWith("col:")) {
      const columnId = key.slice(4);
      return isErpFilterActive(columnFilters?.[columnId]);
    }
    if (isErpFilterActive(appliedValues?.[key])) return true;
    const mappedColumn = panelFilterColumnMap?.[key];
    if (mappedColumn) return isErpFilterActive(columnFilters?.[mappedColumn]);
    return false;
  };

  const source = filterRecordsForFilterOptions({
    records: empresas,
    filterApplyOrder,
    currentOrderKey: orderKey,
    isOrderKeyActive,
    recordPassesOrderKey,
  });

  return buildDistinctOptionsFromRecords(source, (emp) => getEmpresaPanelFieldValue(emp, field));
}

export { buildMgFilterFields };

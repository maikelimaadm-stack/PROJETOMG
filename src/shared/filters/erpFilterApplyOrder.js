import { evaluateErpFilter } from "@/shared/filters/erpFilterEvaluate";
import {
  isErpFilterActive,
  normalizePanelFilterValue,
} from "@/shared/filters/erpFilterState";
import { resolveErpFilterMeta } from "@/shared/filters/erpFilterTypes";

export function resolveColumnFilterOrderKey(columnId, panelFilterColumnMap = {}) {
  const panelKey = Object.entries(panelFilterColumnMap).find(([, columnKey]) => columnKey === columnId)?.[0];
  return panelKey || `col:${columnId}`;
}

export function resolvePanelFilterOrderKey(panelKey) {
  return String(panelKey || "").trim();
}

export function getActiveFilterOrderKeys(filterApplyOrder = [], isOrderKeyActive) {
  const order = Array.isArray(filterApplyOrder) ? filterApplyOrder : [];
  if (typeof isOrderKeyActive !== "function") return order;
  return order.filter((key) => isOrderKeyActive(key));
}

export function getPrimaryFilterOrderKey(filterApplyOrder = [], isOrderKeyActive) {
  const active = getActiveFilterOrderKeys(filterApplyOrder, isOrderKeyActive);
  return active[0] || null;
}

export function getPredecessorFilterOrderKeys(filterApplyOrder = [], currentKey, isOrderKeyActive) {
  const active = getActiveFilterOrderKeys(filterApplyOrder, isOrderKeyActive);
  const index = active.indexOf(currentKey);
  if (index <= 0) return [];
  return active.slice(0, index);
}

export function reconcileFilterApplyOrder(currentOrder = [], activeKeys = []) {
  const order = Array.isArray(currentOrder) ? currentOrder : [];
  const active = Array.isArray(activeKeys) ? activeKeys : [];
  const activeSet = new Set(active);
  const preserved = order.filter((key) => activeSet.has(key));
  const appended = active.filter((key) => !order.includes(key));
  return [...preserved, ...appended];
}

export function collectActiveFilterOrderKeys({
  appliedPanelValues = {},
  columnFilters = {},
  panelFilterColumnMap = {},
} = {}) {
  const keys = new Set();

  Object.entries(appliedPanelValues || {}).forEach(([panelKey, filter]) => {
    if (isErpFilterActive(filter)) keys.add(resolvePanelFilterOrderKey(panelKey));
  });

  Object.entries(columnFilters || {}).forEach(([columnId, filter]) => {
    if (!isErpFilterActive(filter)) return;
    keys.add(resolveColumnFilterOrderKey(columnId, panelFilterColumnMap));
  });

  return [...keys];
}

export function filterRecordsForFilterOptions({
  records = [],
  filterApplyOrder = [],
  currentOrderKey,
  isOrderKeyActive,
  recordPassesOrderKey,
}) {
  const source = Array.isArray(records) ? records : [];
  const currentKey = String(currentOrderKey || "").trim();
  if (!currentKey) return source;

  const primaryKey = getPrimaryFilterOrderKey(filterApplyOrder, isOrderKeyActive);
  if (primaryKey && currentKey === primaryKey) return source;

  const predecessors = getPredecessorFilterOrderKeys(filterApplyOrder, currentKey, isOrderKeyActive);
  if (predecessors.length === 0) return source;

  return source.filter((record) =>
    predecessors.every((key) => recordPassesOrderKey?.(record, key) !== false)
  );
}

export function buildDistinctOptionsFromRecords(records, getOptionValue) {
  return [
    ...new Set(
      (Array.isArray(records) ? records : [])
        .map((record) => getOptionValue(record))
        .filter((value) => value !== null && value !== undefined && String(value).trim() !== "" && value !== "-")
    ),
  ].sort((a, b) => String(a).localeCompare(String(b), "pt-BR", { numeric: true, sensitivity: "base" }));
}

export function createPanelRecordPassesOrderKey({
  appliedPanelValues = {},
  columnFilters = {},
  panelFilterColumnMap = {},
  filterFields = [],
  getEmpresaFieldValue,
  evaluateColumnFilterRecord,
  getColumnMeta,
  getColumnFilterDraft,
}) {
  return (emp, orderKey) => {
    const key = String(orderKey || "").trim();
    if (!key) return true;

    if (key.startsWith("col:")) {
      const columnId = key.slice(4);
      const columnMeta = getColumnMeta?.(columnId);
      const draft = getColumnFilterDraft?.(columnId, columnMeta);
      if (!isErpFilterActive(draft)) return true;
      return evaluateColumnFilterRecord?.(emp, columnMeta, draft) !== false;
    }

    const mappedColumnId = panelFilterColumnMap?.[key];
    if (mappedColumnId) {
      const columnMeta = getColumnMeta?.(mappedColumnId);
      const panelFilter = appliedPanelValues?.[key];
      const columnFilter = columnFilters?.[mappedColumnId];
      const draft = isErpFilterActive(panelFilter)
        ? normalizePanelFilterValue(panelFilter, resolveErpFilterMeta({ key, column: mappedColumnId }).filterType)
        : getColumnFilterDraft?.(mappedColumnId, columnMeta);
      if (!isErpFilterActive(draft)) return true;
      return evaluateColumnFilterRecord?.(emp, columnMeta, draft) !== false;
    }

    const field = filterFields.find((item) => item.key === key);
    if (!field) return true;
    const rawFilter = appliedPanelValues?.[key];
    if (!isErpFilterActive(rawFilter)) return true;

    const filterMeta = resolveErpFilterMeta(field);
    const filter = normalizePanelFilterValue(rawFilter, filterMeta.filterType);
    const displayValue = getEmpresaFieldValue?.(emp, field);
    const rawValue = displayValue === "-" ? "" : displayValue;

    return evaluateErpFilter({
      filter,
      filterType: filterMeta.filterType,
      rawValue,
      displayValue,
    });
  };
}

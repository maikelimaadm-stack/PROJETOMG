import { readEmpPreferencesText } from "@/modules/empresas/preferences/empresasPreferencesCache";

const PRIORITY_FIRST_COLUMNS = ["id_global"];

export const mergeSavedColumnOrder = (savedOrder, baseColumns) => {
  const baseIds = baseColumns.map((col) => col.id);
  const parsed = Array.isArray(savedOrder)
    ? [...new Set(savedOrder.filter((id) => baseIds.includes(id)))]
    : [];
  const missing = baseIds.filter((id) => !parsed.includes(id));
  const merged = [...parsed, ...missing];
  const priorityFirst = PRIORITY_FIRST_COLUMNS.filter((id) => merged.includes(id));
  return [...priorityFirst, ...merged.filter((id) => !priorityFirst.includes(id))];
};

export const mergeSavedVisibleColumns = (savedVisible, baseColumns) => {
  const defaultVisible = baseColumns.filter((col) => col.default).map((col) => col.id);
  const parsed = Array.isArray(savedVisible) ? savedVisible : [];
  return Array.from(new Set([...parsed, ...defaultVisible]));
};

export const loadColumnOrder = (storageKey, baseColumns) => {
  const saved = readEmpPreferencesText(storageKey, null);
  if (!saved) return baseColumns.map((col) => col.id);
  try {
    return mergeSavedColumnOrder(JSON.parse(saved), baseColumns);
  } catch {
    return baseColumns.map((col) => col.id);
  }
};

export const loadVisibleColumns = (storageKey, baseColumns) => {
  const saved = readEmpPreferencesText(storageKey, null);
  if (!saved) return baseColumns.filter((col) => col.default).map((col) => col.id);
  try {
    return mergeSavedVisibleColumns(JSON.parse(saved), baseColumns);
  } catch {
    return baseColumns.filter((col) => col.default).map((col) => col.id);
  }
};

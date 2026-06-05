const PRIORITY_FIRST_COLUMNS = ["id_global"];

export const mergeSavedColumnOrder = (savedOrder, baseColumns) => {
  const baseIds = baseColumns.map((col) => col.id);
  const parsed = Array.isArray(savedOrder)
    ? savedOrder.filter((id) => baseIds.includes(id))
    : [];
  const missing = baseIds.filter((id) => !parsed.includes(id));
  const priorityMissing = PRIORITY_FIRST_COLUMNS.filter((id) => missing.includes(id));
  const regularMissing = missing.filter((id) => !PRIORITY_FIRST_COLUMNS.includes(id));
  const withoutPriority = parsed.filter((id) => !PRIORITY_FIRST_COLUMNS.includes(id));
  return [...priorityMissing, ...withoutPriority, ...regularMissing];
};

export const mergeSavedVisibleColumns = (savedVisible, baseColumns) => {
  const defaultVisible = baseColumns.filter((col) => col.default).map((col) => col.id);
  const parsed = Array.isArray(savedVisible) ? savedVisible : [];
  return Array.from(new Set([...parsed, ...defaultVisible]));
};

export const loadColumnOrder = (storageKey, baseColumns) => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return baseColumns.map((col) => col.id);
  try {
    return mergeSavedColumnOrder(JSON.parse(saved), baseColumns);
  } catch {
    return baseColumns.map((col) => col.id);
  }
};

export const loadVisibleColumns = (storageKey, baseColumns) => {
  const saved = localStorage.getItem(storageKey);
  if (!saved) return baseColumns.filter((col) => col.default).map((col) => col.id);
  try {
    return mergeSavedVisibleColumns(JSON.parse(saved), baseColumns);
  } catch {
    return baseColumns.filter((col) => col.default).map((col) => col.id);
  }
};

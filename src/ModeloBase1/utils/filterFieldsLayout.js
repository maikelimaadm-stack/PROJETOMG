/**
 * Layout de campos de filtro — promovido de empFilterFieldsLayout (genérico).
 */

export const mergeSavedFilterFieldOrder = (savedOrder, catalogKeys) => {
  const baseKeys = Array.isArray(catalogKeys) ? catalogKeys : [];
  const parsed = Array.isArray(savedOrder)
    ? [...new Set(savedOrder.filter((key) => baseKeys.includes(key)))]
    : [];
  const missing = baseKeys.filter((key) => !parsed.includes(key));
  return [...parsed, ...missing];
};

export const mergeSavedVisibleFilterFields = (savedVisible, catalogKeys) => {
  const baseKeys = Array.isArray(catalogKeys) ? catalogKeys : [];
  if (!Array.isArray(savedVisible)) return [...baseKeys];
  return savedVisible.filter((key) => baseKeys.includes(key));
};

export const mergeVisibleFilterFieldsWithCatalog = (savedVisible, catalogKeys, savedOrder = []) => {
  const base = mergeSavedVisibleFilterFields(savedVisible, catalogKeys);
  const knownKeys = Array.isArray(savedOrder)
    ? savedOrder.filter((key) => catalogKeys.includes(key))
    : [];
  const brandNewKeys = catalogKeys.filter((key) => !knownKeys.includes(key));
  return brandNewKeys.length ? [...base, ...brandNewKeys] : base;
};

export const applyFilterFieldsLayout = (catalogFields = [], layout = {}) => {
  const catalog = Array.isArray(catalogFields) ? catalogFields : [];
  const byKey = new Map(catalog.map((field) => [field.key, field]));
  const catalogKeys = catalog.map((field) => field.key);
  const ordem = mergeSavedFilterFieldOrder(layout?.ordem, catalogKeys);
  const visiveis = new Set(mergeSavedVisibleFilterFields(layout?.visiveis, catalogKeys));

  return ordem
    .filter((key) => visiveis.has(key) && byKey.has(key))
    .map((key) => byKey.get(key));
};

export const getDefaultFilterFieldsLayout = (catalogKeys = []) => ({
  visiveis: [...catalogKeys],
  ordem: [...catalogKeys],
});

export function createFilterFieldsLayoutStorage({ adapter, storageKey, updatedEvent }) {
  const loadFilterFieldsLayout = (catalogKeys = []) => {
    const defaultLayout = getDefaultFilterFieldsLayout(catalogKeys);
    if (!catalogKeys.length) return defaultLayout;

    const parsed = adapter?.readJson?.(storageKey, null);
    if (!parsed || typeof parsed !== "object") return defaultLayout;

    const ordem = mergeSavedFilterFieldOrder(parsed?.ordem, catalogKeys);
    const visiveis = mergeVisibleFilterFieldsWithCatalog(parsed?.visiveis, catalogKeys, ordem);
    return { visiveis, ordem };
  };

  const saveFilterFieldsLayout = ({ visiveis = [], ordem = [] } = {}) => {
    adapter?.writeJson?.(storageKey, { visiveis, ordem }, { reason: "listagem:filter-layout" });
    if (updatedEvent) window.dispatchEvent(new CustomEvent(updatedEvent));
  };

  return { loadFilterFieldsLayout, saveFilterFieldsLayout };
}

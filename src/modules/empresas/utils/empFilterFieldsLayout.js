export const EMP_FILTER_FIELDS_LAYOUT_KEY = "emp_filter_fields_layout_v1";

const dispatchLayoutUpdated = () => {
  window.dispatchEvent(new CustomEvent("emp-filter-fields-layout-updated"));
};

export const mergeSavedFilterFieldOrder = (savedOrder, catalogKeys) => {
  const baseKeys = catalogKeys;
  const parsed = Array.isArray(savedOrder)
    ? [...new Set(savedOrder.filter((key) => baseKeys.includes(key)))]
    : [];
  const missing = baseKeys.filter((key) => !parsed.includes(key));
  return [...parsed, ...missing];
};

export const mergeSavedVisibleFilterFields = (savedVisible, catalogKeys) => {
  const parsed = Array.isArray(savedVisible)
    ? savedVisible.filter((key) => catalogKeys.includes(key))
    : [];
  if (parsed.length === 0) return [...catalogKeys];
  return parsed;
};

/** Novos campos do catálogo entram em uso por padrão, sem reativar os removidos pelo usuário. */
export const mergeVisibleFilterFieldsWithCatalog = (savedVisible, catalogKeys) => {
  const base = mergeSavedVisibleFilterFields(savedVisible, catalogKeys);
  const missing = catalogKeys.filter((key) => !base.includes(key));
  return missing.length ? [...base, ...missing] : base;
};

export const loadFilterFieldsLayout = (catalogKeys = []) => {
  const defaultLayout = {
    visiveis: [...catalogKeys],
    ordem: [...catalogKeys],
  };

  if (typeof localStorage === "undefined" || catalogKeys.length === 0) {
    return defaultLayout;
  }

  const saved = localStorage.getItem(EMP_FILTER_FIELDS_LAYOUT_KEY);
  if (!saved) return defaultLayout;

  try {
    const parsed = JSON.parse(saved);
    const ordem = mergeSavedFilterFieldOrder(parsed?.ordem, catalogKeys);
    const visiveis = mergeSavedVisibleFilterFields(parsed?.visiveis, catalogKeys);
    return { visiveis, ordem };
  } catch {
    return defaultLayout;
  }
};

export const saveFilterFieldsLayout = ({ visiveis = [], ordem = [] } = {}) => {
  if (typeof localStorage === "undefined") return;
  localStorage.setItem(
    EMP_FILTER_FIELDS_LAYOUT_KEY,
    JSON.stringify({ visiveis, ordem })
  );
  dispatchLayoutUpdated();
};

export const applyFilterFieldsLayout = (catalogFields = [], layout = {}) => {
  const byKey = new Map(catalogFields.map((field) => [field.key, field]));
  const ordem = mergeSavedFilterFieldOrder(
    layout.ordem,
    catalogFields.map((field) => field.key)
  );
  const visiveis = new Set(
    mergeSavedVisibleFilterFields(
      layout.visiveis,
      catalogFields.map((field) => field.key)
    )
  );

  return ordem
    .filter((key) => visiveis.has(key) && byKey.has(key))
    .map((key) => byKey.get(key));
};

export const getDefaultFilterFieldsLayout = (catalogKeys = []) => ({
  visiveis: [...catalogKeys],
  ordem: [...catalogKeys],
});

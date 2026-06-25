import {
  readEmpPreferencesJson,
  writeEmpPreferencesJson,
  readEmpPreferencesText,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import {
  DEFAULT_FILTER_MAX_VISIBLE,
  FILTER_MAX_VISIBLE_KEY,
} from "@/modules/empresas/components/tblEmp.constants";

export const EMP_FILTER_FIELDS_LAYOUT_KEY = "emp_filter_fields_layout_v1";

const MAX_FILTER_FIELDS_LIMIT = 12;

const dispatchLayoutUpdated = () => {
  window.dispatchEvent(new CustomEvent("emp-filter-fields-layout-updated"));
};

export const normalizeFilterMaxVisible = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return DEFAULT_FILTER_MAX_VISIBLE;
  return Math.max(1, Math.min(MAX_FILTER_FIELDS_LIMIT, Math.round(parsed)));
};

export const loadFilterMaxVisible = () =>
  normalizeFilterMaxVisible(readEmpPreferencesText(FILTER_MAX_VISIBLE_KEY, DEFAULT_FILTER_MAX_VISIBLE));

export const saveFilterMaxVisible = (value) => {
  writeEmpPreferencesText(FILTER_MAX_VISIBLE_KEY, String(normalizeFilterMaxVisible(value)), {
    reason: "listagem:filter-max-visible",
  });
  dispatchLayoutUpdated();
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
  if (!Array.isArray(savedVisible)) return [...catalogKeys];
  return savedVisible.filter((key) => catalogKeys.includes(key));
};

/** Novos campos do catálogo entram em uso por padrão, sem reativar os removidos pelo usuário. */
export const mergeVisibleFilterFieldsWithCatalog = (
  savedVisible,
  catalogKeys,
  savedOrder = []
) => {
  const base = mergeSavedVisibleFilterFields(savedVisible, catalogKeys);
  const knownKeys = Array.isArray(savedOrder)
    ? savedOrder.filter((key) => catalogKeys.includes(key))
    : [];
  const brandNewKeys = catalogKeys.filter((key) => !knownKeys.includes(key));
  return brandNewKeys.length ? [...base, ...brandNewKeys] : base;
};

export const loadFilterFieldsLayout = (catalogKeys = []) => {
  const defaultLayout = {
    visiveis: [...catalogKeys],
    ordem: [...catalogKeys],
    maxVisible: loadFilterMaxVisible(),
  };

  if (catalogKeys.length === 0) {
    return defaultLayout;
  }

  const parsed = readEmpPreferencesJson(EMP_FILTER_FIELDS_LAYOUT_KEY, null);
  if (!parsed || typeof parsed !== "object") return defaultLayout;
  const ordem = mergeSavedFilterFieldOrder(parsed?.ordem, catalogKeys);
  const visiveis = mergeVisibleFilterFieldsWithCatalog(parsed?.visiveis, catalogKeys, ordem);
  return {
    visiveis,
    ordem,
    maxVisible: normalizeFilterMaxVisible(parsed?.maxVisible ?? loadFilterMaxVisible()),
  };
};

export const saveFilterFieldsLayout = ({ visiveis = [], ordem = [], maxVisible } = {}) => {
  const normalizedMax = normalizeFilterMaxVisible(maxVisible ?? loadFilterMaxVisible());
  writeEmpPreferencesJson(
    EMP_FILTER_FIELDS_LAYOUT_KEY,
    { visiveis, ordem, maxVisible: normalizedMax },
    { reason: "listagem:filter-layout" }
  );
  writeEmpPreferencesText(FILTER_MAX_VISIBLE_KEY, String(normalizedMax), {
    reason: "listagem:filter-max-visible",
    emit: false,
  });
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
  const maxVisible = normalizeFilterMaxVisible(layout.maxVisible ?? loadFilterMaxVisible());

  return ordem
    .filter((key) => visiveis.has(key) && byKey.has(key))
    .slice(0, maxVisible)
    .map((key) => byKey.get(key));
};

export const getDefaultFilterFieldsLayout = (catalogKeys = []) => ({
  visiveis: [...catalogKeys],
  ordem: [...catalogKeys],
  maxVisible: DEFAULT_FILTER_MAX_VISIBLE,
});

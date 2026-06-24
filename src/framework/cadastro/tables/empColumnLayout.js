import {
  readEmpPreferencesText,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import { VISIBLE_INITIALIZED_KEY } from "@/modules/empresas/components/tblEmp.constants";

const PRIORITY_FIRST_COLUMNS = ["id_global"];

export const isVisibleColumnsInitialized = () =>
  readEmpPreferencesText(VISIBLE_INITIALIZED_KEY, null) === "1";

export const markVisibleColumnsInitialized = () => {
  writeEmpPreferencesText(VISIBLE_INITIALIZED_KEY, "1", {
    reason: "listagem:hydrate",
    emit: false,
  });
};

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

/**
 * Respeita preferência salva pelo usuário. Defaults só quando não há preferência inicializada.
 */
export const mergeSavedVisibleColumns = (savedVisible, baseColumns, { initialized = false } = {}) => {
  const defaultVisible = baseColumns.filter((col) => col.default).map((col) => col.id);
  const baseIds = new Set(baseColumns.map((col) => col.id));

  if (!initialized) {
    if (!Array.isArray(savedVisible)) return defaultVisible;
    const parsed = [...new Set(savedVisible.filter((id) => baseIds.has(id)))];
    return parsed.length > 0 ? parsed : defaultVisible;
  }

  if (!Array.isArray(savedVisible)) {
    console.warn("[empColumnLayout] preferência de colunas visíveis corrompida — usando defaults");
    return defaultVisible;
  }

  return [...new Set(savedVisible.filter((id) => baseIds.has(id)))];
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
  const initialized = isVisibleColumnsInitialized();
  if (!saved) {
    return initialized
      ? []
      : baseColumns.filter((col) => col.default).map((col) => col.id);
  }
  try {
    return mergeSavedVisibleColumns(JSON.parse(saved), baseColumns, { initialized });
  } catch {
    console.warn("[empColumnLayout] falha ao parsear colunas visíveis — usando defaults");
    return baseColumns.filter((col) => col.default).map((col) => col.id);
  }
};

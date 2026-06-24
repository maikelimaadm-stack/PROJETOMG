import {
  AGGR_KEY,
  FILTERS_KEY,
  FROZEN_KEY,
  ORDER_KEY,
  PAGE_SIZE_KEY,
  SORT_KEY,
  VISIBLE_KEY,
  WIDTHS_KEY,
} from "@/modules/empresas/components/tblEmp.constants";
import {
  EMP_CARDS_LAYOUT_KEY,
  EMP_SEARCH_DROPDOWN_VIS_KEY,
  EMP_SEARCH_FAV_KEY,
  EMP_SEARCH_VIS_KEY,
  EMP_SEARCH_VIS_KEY_LEGACY,
} from "@/modules/empresas/components/empSearchView.constants";
import { EMP_FILTER_FIELDS_LAYOUT_KEY } from "@/modules/empresas/utils/empFilterFieldsLayout";
import { EMP_LOAD_BATCH_STORAGE_KEY } from "@/modules/empresas/hooks/useEmpresasInfiniteData";
import { getLayoutStorageKeysForModule } from "@/framework/cadastro-engine/core/CadastroModuleConfig";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig";
import {
  readEmpPreferencesJson,
  readEmpPreferencesText,
  withEmpPreferencesCacheBatch,
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
} from "@/modules/empresas/preferences/empresasPreferencesCache";

export const EMPRESAS_LISTAGEM_SCOPE = Object.freeze({
  modulo: "empresas",
  tela: "listagem",
});

export const EMPRESAS_FORM_SCOPE = Object.freeze({
  modulo: "empresas",
  tela: "form_layout",
});

export const EMP_VIEW_MODE_STORAGE_KEY = "emp_view_mode_v1";
export const EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY = "emp_launch_panel_style_v1";
export const EMP_PREFS_MIGRATION_MARKER_PREFIX = "emp_user_preferences_migrated_v1";

const FORBIDDEN_TABLE_KEYS = new Set([
  "groupBy",
  "groupByColumns",
  "grouping",
  "pinnedRight",
  "pinnedRightColumnIds",
  "rightPinnedColumns",
]);

const safeParseJson = (raw, fallback = null) => {
  try {
    if (!raw) return fallback;
    return JSON.parse(raw);
  } catch {
    return fallback;
  }
};

const safeStringify = (value) => {
  try {
    return JSON.stringify(value);
  } catch {
    return null;
  }
};

const readStorage = (key) => readEmpPreferencesText(key, null);

const writeStorage = (key, value, reason = "listagem:update") => {
  if (value == null) return;
  writeEmpPreferencesText(key, value, { reason });
};

const normalizeViewMode = (value) => {
  if (value === "search") return "search";
  if (value === "record") return "record";
  return "table";
};

const normalizeLaunchPanelStyle = (value) => (value === "sidebar" ? "sidebar" : "tabs");

const sanitizeTablePreferences = (table = {}) => {
  const next = { ...table };
  FORBIDDEN_TABLE_KEYS.forEach((key) => {
    if (key in next) delete next[key];
  });
  return next;
};

export const readStoredEmpViewMode = () => normalizeViewMode(readStorage(EMP_VIEW_MODE_STORAGE_KEY));

export const writeStoredEmpViewMode = (mode) => {
  writeStorage(EMP_VIEW_MODE_STORAGE_KEY, normalizeViewMode(mode), "listagem:view-mode");
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("emp-view-mode-updated"));
  }
};

export const readStoredLaunchPanelStyle = () =>
  normalizeLaunchPanelStyle(readStorage(EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY));

export const writeStoredLaunchPanelStyle = (style) => {
  writeStorage(
    EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY,
    normalizeLaunchPanelStyle(style),
    "listagem:panel-style"
  );
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("emp-launch-panel-style-updated"));
  }
};

export const getEmpPreferencesMigrationMarkerKey = (userId) =>
  `${EMP_PREFS_MIGRATION_MARKER_PREFIX}:${String(userId || "anon")}`;

export const markEmpPreferencesMigrated = (userId) => {
  writeStorage(getEmpPreferencesMigrationMarkerKey(userId), new Date().toISOString(), "migration:marker");
};

export const isEmpPreferencesMigrated = (userId) => Boolean(readStorage(getEmpPreferencesMigrationMarkerKey(userId)));

export const buildListagemPreferencesFromStorage = () => {
  const table = sanitizeTablePreferences({
    columnOrder: safeParseJson(readStorage(ORDER_KEY), []),
    visibleColumns: safeParseJson(readStorage(VISIBLE_KEY), []),
    columnWidths: safeParseJson(readStorage(WIDTHS_KEY), {}),
    frozenLeftColumnCount: Number(readStorage(FROZEN_KEY) || 0) || 0,
    columnFilters: safeParseJson(readStorage(FILTERS_KEY), {}),
    sort: safeParseJson(readStorage(SORT_KEY), [{ key: "codempresa", direction: "asc" }]),
    pageSize: Number(readStorage(PAGE_SIZE_KEY) || 100) || 100,
    aggregationConfig: safeParseJson(readStorage(AGGR_KEY), {}),
    loadBatchSize: Number(readStorage(EMP_LOAD_BATCH_STORAGE_KEY) || 100) || 100,
  });

  const visibleCardsRaw = readStorage(EMP_SEARCH_VIS_KEY) || readStorage(EMP_SEARCH_VIS_KEY_LEGACY);

  return {
    version: 1,
    viewMode: readStoredEmpViewMode(),
    filters: {
      filterFieldsLayout: safeParseJson(readStorage(EMP_FILTER_FIELDS_LAYOUT_KEY), {
        visiveis: [],
        ordem: [],
      }),
      dropdownVisibleFields: safeParseJson(readStorage(EMP_SEARCH_DROPDOWN_VIS_KEY), {}),
      favorites: safeParseJson(readStorage(EMP_SEARCH_FAV_KEY), []),
    },
    table,
    cards: {
      visibleFields: safeParseJson(visibleCardsRaw, {}),
      layoutConfig: safeParseJson(readStorage(EMP_CARDS_LAYOUT_KEY), { cardsPerRow: 3 }),
    },
    panels: {
      launchPanelStyle: readStoredLaunchPanelStyle(),
    },
  };
};

export const applyListagemPreferencesToStorage = (preferences = {}) => {
  if (typeof window === "undefined" || !preferences || typeof preferences !== "object") return;

  withEmpPreferencesCacheBatch(() => {
    if (preferences.viewMode) {
      writeStoredEmpViewMode(preferences.viewMode);
    }

    if (preferences.panels?.launchPanelStyle) {
      writeStoredLaunchPanelStyle(preferences.panels.launchPanelStyle);
    }

    const table = sanitizeTablePreferences(preferences.table || {});
    if (table.columnOrder) writeStorage(ORDER_KEY, safeStringify(table.columnOrder), "listagem:table");
    if (table.visibleColumns) writeStorage(VISIBLE_KEY, safeStringify(table.visibleColumns), "listagem:table");
    if (table.columnWidths) writeStorage(WIDTHS_KEY, safeStringify(table.columnWidths), "listagem:table");
    if (table.frozenLeftColumnCount != null) {
      writeStorage(
        FROZEN_KEY,
        String(Number(table.frozenLeftColumnCount) || 0),
        "listagem:table"
      );
    }
    if (table.columnFilters) writeStorage(FILTERS_KEY, safeStringify(table.columnFilters), "listagem:table");
    if (table.sort) writeStorage(SORT_KEY, safeStringify(table.sort), "listagem:table");
    if (table.pageSize != null) {
      writeStorage(PAGE_SIZE_KEY, String(Number(table.pageSize) || 100), "listagem:table");
    }
    if (table.aggregationConfig) {
      writeStorage(AGGR_KEY, safeStringify(table.aggregationConfig), "listagem:table");
    }
    if (table.loadBatchSize != null) {
      writeStorage(
        EMP_LOAD_BATCH_STORAGE_KEY,
        String(Number(table.loadBatchSize) || 100),
        "listagem:table"
      );
    }

    if (preferences.filters?.filterFieldsLayout) {
      writeStorage(
        EMP_FILTER_FIELDS_LAYOUT_KEY,
        safeStringify(preferences.filters.filterFieldsLayout),
        "listagem:filters"
      );
    }
    if (preferences.filters?.dropdownVisibleFields) {
      writeStorage(
        EMP_SEARCH_DROPDOWN_VIS_KEY,
        safeStringify(preferences.filters.dropdownVisibleFields),
        "listagem:filters"
      );
    }
    if (preferences.filters?.favorites) {
      writeStorage(EMP_SEARCH_FAV_KEY, safeStringify(preferences.filters.favorites), "listagem:filters");
    }

    if (preferences.cards?.visibleFields) {
      writeStorage(EMP_SEARCH_VIS_KEY, safeStringify(preferences.cards.visibleFields), "listagem:cards");
    }
    if (preferences.cards?.layoutConfig) {
      writeStorage(EMP_CARDS_LAYOUT_KEY, safeStringify(preferences.cards.layoutConfig), "listagem:cards");
    }
  }, "bootstrap:apply-listagem");

  window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
  window.dispatchEvent(new CustomEvent("emp-filter-fields-layout-updated"));
  window.dispatchEvent(new CustomEvent("emp-favorites-updated"));
};

export const buildFormLayoutPreferencesFromStorage = (userId) => {
  if (!userId || typeof window === "undefined") return null;
  const { layoutKey } = getLayoutStorageKeysForModule(empresasCadastroConfig, userId);
  const parsedLayout = readEmpPreferencesJson(layoutKey, null);
  if (!parsedLayout || typeof parsedLayout !== "object") return null;
  return {
    version: 3,
    activeConfig: parsedLayout,
  };
};

export const applyFormLayoutPreferencesToStorage = (userId, preferences, updatedAt) => {
  if (!userId || typeof window === "undefined") return;
  const { layoutKey } = getLayoutStorageKeysForModule(empresasCadastroConfig, userId);
  const activeConfig =
    preferences && typeof preferences === "object" && preferences.activeConfig
      ? preferences.activeConfig
      : preferences;
  if (!activeConfig || typeof activeConfig !== "object") return;
  const nextConfigJson = safeStringify(activeConfig);
  const currentConfigJson = safeStringify(readEmpPreferencesJson(layoutKey, null));
  const currentUpdatedAt = readEmpPreferencesText(`${layoutKey}__updatedAt`, null);
  const nextUpdatedAt = updatedAt || currentUpdatedAt || new Date().toISOString();
  if (nextConfigJson && nextConfigJson === currentConfigJson && currentUpdatedAt === nextUpdatedAt) {
    return;
  }
  withEmpPreferencesCacheBatch(() => {
    writeEmpPreferencesJson(layoutKey, activeConfig, { reason: "form-layout:hydrate" });
    writeEmpPreferencesText(`${layoutKey}__updatedAt`, nextUpdatedAt, {
      reason: "form-layout:hydrate",
    });
  }, "bootstrap:apply-form");
  window.dispatchEvent(new Event("cadastro-layout-updated:empresas"));
  window.dispatchEvent(
    new CustomEvent("cadastro-layout-hydrated:empresas", {
      detail: { userId, moduleId: "empresas" },
    })
  );
};

export const mapBootstrapPreferences = (bootstrapPayload) => {
  const records = Array.isArray(bootstrapPayload?.preferences)
    ? bootstrapPayload.preferences
    : [];
  return records.reduce((acc, record) => {
    const modulo = String(record?.modulo || "").trim().toLowerCase();
    const tela = String(record?.tela || "").trim().toLowerCase();
    if (!modulo || !tela) return acc;
    acc[`${modulo}.${tela}`] = record;
    return acc;
  }, {});
};


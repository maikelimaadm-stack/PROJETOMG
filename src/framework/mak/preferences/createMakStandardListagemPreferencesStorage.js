/**
 * Storage genérico de preferências de listagem — paridade com Empresas.
 */
import { markVisibleColumnsInitialized } from "@/framework/cadastro/tables/empColumnLayout";
import { normalizeEmpListViewMode } from "@/framework/mak/layout/mgViewMode.js";
import { dispatchModuleEvent } from "@/framework/mak/events/makModuleEvents.js";
import {
  buildScopedTempFilterStorageKey,
  buildUserPrefStorageKey,
} from "@/shared/preferences/userPreferencesScope.js";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import { createMakLaunchPanelStyleStorage } from "./createMakLaunchPanelStyleStorage.js";

const DEFAULT_FILTER_MAX_VISIBLE = 6;
const LISTAGEM_DOCUMENT_VERSION = 2;

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

const toObject = (value, fallback = {}) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : fallback;

const normalizeForStableCompare = (value) => {
  if (Array.isArray(value)) return value.map((item) => normalizeForStableCompare(item));
  if (value && typeof value === "object") {
    return Object.keys(value)
      .sort()
      .reduce((acc, key) => {
        acc[key] = normalizeForStableCompare(value[key]);
        return acc;
      }, {});
  }
  return value;
};

const stableStringify = (value) => safeStringify(normalizeForStableCompare(value ?? null));

const sanitizeTablePreferences = (table = {}) => {
  const sanitized = { ...toObject(table) };
  ["groupBy", "groupByColumns", "grouping", "pinnedRight", "pinnedRightColumnIds", "rightPinnedColumns"].forEach(
    (key) => delete sanitized[key]
  );
  return sanitized;
};

export function createMakStandardListagemPreferencesStorage({
  moduleId,
  keyPrefix,
  adapter,
  scopeState,
  tablePreferenceKeys = {},
  searchStorageKeys = {},
  defaultSort = { key: "codigo", direction: "asc" },
  loadBatchStorageKey = null,
  defaultFilterMaxVisible = DEFAULT_FILTER_MAX_VISIBLE,
}) {
  const prefix = String(keyPrefix || moduleId).trim();
  const keys = {
    WIDTHS_KEY: tablePreferenceKeys.WIDTHS_KEY ?? `${prefix}_col_widths`,
    FROZEN_KEY: tablePreferenceKeys.FROZEN_KEY ?? `${prefix}_col_frozen`,
    VISIBLE_KEY: tablePreferenceKeys.VISIBLE_KEY ?? `${prefix}_col_visiveis`,
    ORDER_KEY: tablePreferenceKeys.ORDER_KEY ?? `${prefix}_col_ordem`,
    AGGR_KEY: tablePreferenceKeys.AGGR_KEY ?? `${prefix}_table_aggregation_config`,
    PAGE_SIZE_KEY: tablePreferenceKeys.PAGE_SIZE_KEY ?? `${prefix}_table_page_size`,
    SORT_KEY: tablePreferenceKeys.SORT_KEY ?? `${prefix}_sort_columns_v1`,
    SIZING_MODE_KEY: tablePreferenceKeys.SIZING_MODE_KEY ?? `${prefix}_col_sizing_mode_v1`,
    FILTER_OPERATORS_KEY: tablePreferenceKeys.FILTER_OPERATORS_KEY ?? `${prefix}_filter_operators_v1`,
    FILTER_MAX_VISIBLE_KEY: tablePreferenceKeys.FILTER_MAX_VISIBLE_KEY ?? `${prefix}_filter_max_visible_v1`,
    VIEW_MODE_KEY: searchStorageKeys.viewModeKey ?? `${prefix}_view_mode_v1`,
    CARDS_LAYOUT_KEY: searchStorageKeys.cardsLayoutKey ?? `${prefix}_cards_layout_v1`,
    SEARCH_VIS_KEY: searchStorageKeys.cardsVisKey ?? `${prefix}_search_vis_fields_v2`,
    DROPDOWN_VIS_KEY: searchStorageKeys.dropdownVisKey ?? `${prefix}_search_dropdown_vis_v1`,
    FILTER_FIELDS_LAYOUT_KEY:
      searchStorageKeys.filterFieldsLayoutKey ?? `${prefix}_filter_fields_layout_v1`,
    FAVORITES_KEY: searchStorageKeys.favoritesKey ?? `${prefix}_search_favorites_v1`,
    LOAD_BATCH_KEY: loadBatchStorageKey ?? `${prefix}_infinite_batch_size`,
  };

  const launchPanelStorage = createMakLaunchPanelStyleStorage({ keyPrefix: prefix, moduleId });
  const migrationMarkerPrefix = `${prefix}_user_preferences_migrated_v1`;

  const readText = (key, fallback = null) => adapter.readText(key, fallback);
  const readJson = (key, fallback = null) => adapter.readJson(key, fallback);
  const writeText = (key, value, reason) =>
    adapter.writeText(key, value, { reason, moduleId });
  const writeJson = (key, value, reason) =>
    adapter.writeJson(key, value, { reason, moduleId });

  const getTempFilterStorageKey = () =>
    buildScopedTempFilterStorageKey({ modulo: moduleId, tela: "listagem" });

  const readStoredTempListagemFilters = () => toObject(readJson(getTempFilterStorageKey(), {}), {});
  const writeStoredTempListagemFilters = (filters) =>
    writeJson(getTempFilterStorageKey(), toObject(filters, {}), "listagem:temp-filters");

  const readStoredFilterOperators = () => toObject(readJson(keys.FILTER_OPERATORS_KEY, {}), {});
  const writeStoredFilterOperators = (operatorsByField = {}) =>
    writeJson(keys.FILTER_OPERATORS_KEY, toObject(operatorsByField, {}), "listagem:filter-operators");

  const readStoredViewMode = () => normalizeEmpListViewMode(readText(keys.VIEW_MODE_KEY, "table"));
  const writeStoredViewMode = (mode, reason = "listagem:view-mode") => {
    writeText(keys.VIEW_MODE_KEY, normalizeEmpListViewMode(mode), reason);
    dispatchModuleEvent(moduleId, "view-mode-updated");
  };

  const getMigrationMarkerKey = (userId) => `${migrationMarkerPrefix}:${String(userId || "anon")}`;
  const markPreferencesMigrated = (userId) =>
    writeText(getMigrationMarkerKey(userId), new Date().toISOString(), "migration:marker");
  const isPreferencesMigrated = (userId) => Boolean(readText(getMigrationMarkerKey(userId), null));

  const listagemScopedFieldKeys = [
    keys.VISIBLE_KEY,
    keys.ORDER_KEY,
    keys.WIDTHS_KEY,
    keys.SORT_KEY,
    keys.VIEW_MODE_KEY,
    keys.CARDS_LAYOUT_KEY,
    keys.SEARCH_VIS_KEY,
    keys.FILTER_FIELDS_LAYOUT_KEY,
    keys.FILTER_OPERATORS_KEY,
  ];

  const hasScopedListagemPreferences = () =>
    listagemScopedFieldKeys.some((fieldKey) => {
      const scoped = buildUserPrefStorageKey({
        modulo: moduleId,
        tela: "listagem",
        field: fieldKey,
      });
      return readText(scoped, null) != null || readText(fieldKey, null) != null;
    });

  const buildListagemPreferencesFromStorage = () => {
    const table = sanitizeTablePreferences({
      columnOrder: readJson(keys.ORDER_KEY, []),
      visibleColumns: readJson(keys.VISIBLE_KEY, []),
      columnWidths: readJson(keys.WIDTHS_KEY, {}),
      columnSizingMode: readJson(keys.SIZING_MODE_KEY, {}),
      frozenLeftColumnCount: Number(readText(keys.FROZEN_KEY, "0") || 0) || 0,
      sort: readJson(keys.SORT_KEY, [defaultSort]),
      pageSize: Number(readText(keys.PAGE_SIZE_KEY, "100") || 100) || 100,
      aggregationConfig: readJson(keys.AGGR_KEY, {}),
      loadBatchSize: Number(readText(keys.LOAD_BATCH_KEY, "100") || 100) || 100,
    });

    return {
      version: LISTAGEM_DOCUMENT_VERSION,
      table,
      cards: {
        visibleFields: readJson(keys.SEARCH_VIS_KEY, {}),
        fieldOrder: Object.keys(readJson(keys.SEARCH_VIS_KEY, {}) || {}),
        cardsPerRow: Number(readJson(keys.CARDS_LAYOUT_KEY, { cardsPerRow: 3 })?.cardsPerRow || 3),
        layoutConfig: readJson(keys.CARDS_LAYOUT_KEY, { cardsPerRow: 3 }),
        density: "normal",
      },
      filtersConfig: {
        filterFieldsLayout: readJson(keys.FILTER_FIELDS_LAYOUT_KEY, {
          visiveis: [],
          ordem: [],
          maxVisible: defaultFilterMaxVisible,
        }),
        maxVisibleFields:
          Number(readText(keys.FILTER_MAX_VISIBLE_KEY, String(defaultFilterMaxVisible))) ||
          defaultFilterMaxVisible,
        operatorsByField: readStoredFilterOperators(),
        dropdownVisibleFields: readJson(keys.DROPDOWN_VIS_KEY, {}),
        favorites: readJson(keys.FAVORITES_KEY, []),
      },
      view: {
        mode: readStoredViewMode(),
        launchPanelStyle: launchPanelStorage.readStoredLaunchPanelStyle(),
      },
      meta: { revision: 0, updatedAt: null },
    };
  };

  const normalizeListagemDocument = (preferences = {}) => {
    const incoming = toObject(preferences, {});
    const legacyFilters = toObject(incoming.filters, {});
    const normalized = {
      version: Number(incoming.version) || LISTAGEM_DOCUMENT_VERSION,
      table: sanitizeTablePreferences(toObject(incoming.table, {})),
      cards: toObject(incoming.cards, {}),
      filtersConfig: toObject(incoming.filtersConfig, {}),
      view: toObject(incoming.view, {}),
      meta: toObject(incoming.meta, {}),
    };
    if (!normalized.view.mode && incoming.viewMode) normalized.view.mode = incoming.viewMode;
    if (!normalized.view.launchPanelStyle && incoming.panels?.launchPanelStyle) {
      normalized.view.launchPanelStyle = incoming.panels.launchPanelStyle;
    }
    if (!Object.keys(normalized.filtersConfig).length && Object.keys(legacyFilters).length) {
      normalized.filtersConfig = {
        filterFieldsLayout: legacyFilters.filterFieldsLayout,
        maxVisibleFields: legacyFilters.maxVisibleFields,
        operatorsByField: legacyFilters.operatorsByField,
        dropdownVisibleFields: legacyFilters.dropdownVisibleFields,
        favorites: legacyFilters.favorites,
      };
    }
    return normalized;
  };

  const applyListagemPreferencesToStorage = (preferences = {}, options = {}) => {
    if (typeof window === "undefined" || !preferences || typeof preferences !== "object") return false;
    const {
      respectDirtySections = false,
      skipUnchangedSections = false,
      reason = "listagem:hydrate",
    } = options;
    const normalized = normalizeListagemDocument(preferences);
    const current = buildListagemPreferencesFromStorage();
    let visualChange = false;

    const shouldApplySection = (section, nextSlice, currentSlice) => {
      if (respectDirtySections && !scopeState.canApplyRemoteSection(section)) return false;
      if (skipUnchangedSections && stableJsonEqual(nextSlice ?? null, currentSlice ?? null)) {
        return false;
      }
      return true;
    };

    if (
      normalized.view.mode &&
      shouldApplySection("view", { mode: normalized.view.mode }, { mode: current.view?.mode })
    ) {
      writeStoredViewMode(normalized.view.mode, reason);
      visualChange = true;
    }

    if (
      normalized.view.launchPanelStyle &&
      shouldApplySection(
        "view",
        { launchPanelStyle: normalized.view.launchPanelStyle },
        { launchPanelStyle: current.view?.launchPanelStyle }
      )
    ) {
      launchPanelStorage.writeStoredLaunchPanelStyle(normalized.view.launchPanelStyle, reason);
      visualChange = true;
    }

    const table = sanitizeTablePreferences(normalized.table || {});
    if (shouldApplySection("table", table, current.table)) {
      if (table.columnOrder) writeJson(keys.ORDER_KEY, table.columnOrder, reason);
      if (table.visibleColumns) {
        writeJson(keys.VISIBLE_KEY, table.visibleColumns, reason);
        markVisibleColumnsInitialized();
      }
      if (table.columnWidths) writeJson(keys.WIDTHS_KEY, table.columnWidths, reason);
      if (table.columnSizingMode) writeJson(keys.SIZING_MODE_KEY, table.columnSizingMode, reason);
      if (table.frozenLeftColumnCount != null) {
        writeText(keys.FROZEN_KEY, String(Number(table.frozenLeftColumnCount) || 0), reason);
      }
      if (table.sort) writeJson(keys.SORT_KEY, table.sort, reason);
      if (table.pageSize != null) writeText(keys.PAGE_SIZE_KEY, String(Number(table.pageSize) || 100), reason);
      if (table.aggregationConfig) writeJson(keys.AGGR_KEY, table.aggregationConfig, reason);
      if (table.loadBatchSize != null) {
        writeText(keys.LOAD_BATCH_KEY, String(Number(table.loadBatchSize) || 100), reason);
      }
      visualChange = true;
    }

    const filtersConfig = toObject(normalized.filtersConfig, {});
    if (shouldApplySection("filtersConfig", filtersConfig, current.filtersConfig)) {
      if (filtersConfig.filterFieldsLayout) {
        writeJson(keys.FILTER_FIELDS_LAYOUT_KEY, filtersConfig.filterFieldsLayout, reason);
      }
      if (filtersConfig.maxVisibleFields != null) {
        writeText(keys.FILTER_MAX_VISIBLE_KEY, String(Number(filtersConfig.maxVisibleFields) || defaultFilterMaxVisible), reason);
      }
      if (filtersConfig.dropdownVisibleFields) {
        writeJson(keys.DROPDOWN_VIS_KEY, filtersConfig.dropdownVisibleFields, reason);
      }
      if (filtersConfig.favorites) writeJson(keys.FAVORITES_KEY, filtersConfig.favorites, reason);
      if (filtersConfig.operatorsByField) {
        writeJson(keys.FILTER_OPERATORS_KEY, toObject(filtersConfig.operatorsByField, {}), reason);
      }
      visualChange = true;
    }

    if (shouldApplySection("cards", normalized.cards, current.cards)) {
      if (normalized.cards?.visibleFields) {
        writeJson(keys.SEARCH_VIS_KEY, toObject(normalized.cards.visibleFields, {}), reason);
      }
      if (normalized.cards?.layoutConfig || normalized.cards?.cardsPerRow) {
        writeJson(
          keys.CARDS_LAYOUT_KEY,
          normalized.cards.layoutConfig || { cardsPerRow: Number(normalized.cards.cardsPerRow) || 3 },
          reason
        );
      }
      visualChange = true;
    }

    if (visualChange) {
      dispatchModuleEvent(moduleId, "view-mode-updated");
      dispatchModuleEvent(moduleId, "column-layout-updated");
      dispatchModuleEvent(moduleId, "filter-fields-layout-updated");
      dispatchModuleEvent(moduleId, "favorites-updated");
    }

    return visualChange;
  };

  const applyRemoteListagemPreferencesToStorage = (preferences = {}) =>
    applyListagemPreferencesToStorage(preferences, {
      respectDirtySections: true,
      skipUnchangedSections: true,
      reason: "listagem:remote-sync",
    });

  const applyListagemPreferencesPatchToStorage = (patch = {}) => {
    applyListagemPreferencesToStorage(normalizeListagemDocument(patch));
  };

  const mapBootstrapPreferences = (bootstrapPayload) => {
    const records = Array.isArray(bootstrapPayload?.preferences) ? bootstrapPayload.preferences : [];
    return records.reduce((acc, record) => {
      const modulo = String(record?.modulo || "").trim().toLowerCase();
      const tela = String(record?.tela || "").trim().toLowerCase();
      if (!modulo || !tela) return acc;
      acc[`${modulo}.${tela}`] = record;
      return acc;
    }, {});
  };

  return {
    moduleId,
    keyPrefix: prefix,
    keys,
    listagemScope: { modulo: moduleId, tela: "listagem" },
    launchPanelStorage,
    readStoredTempListagemFilters,
    writeStoredTempListagemFilters,
    readStoredFilterOperators,
    writeStoredFilterOperators,
    readStoredViewMode,
    writeStoredViewMode,
    markPreferencesMigrated,
    isPreferencesMigrated,
    hasScopedListagemPreferences,
    buildListagemPreferencesFromStorage,
    applyListagemPreferencesToStorage,
    applyRemoteListagemPreferencesToStorage,
    applyListagemPreferencesPatchToStorage,
    mapBootstrapPreferences,
    stableStringify,
  };
}

export default createMakStandardListagemPreferencesStorage;

import {
  AGGR_KEY,
  DEFAULT_FILTER_MAX_VISIBLE,
  FILTERS_KEY,
  FILTER_MAX_VISIBLE_KEY,
  FROZEN_KEY,
  ORDER_KEY,
  PAGE_SIZE_KEY,
  SIZING_MODE_KEY,
  SORT_KEY,
  VISIBLE_KEY,
  WIDTHS_KEY,
} from "@/modules/empresas/components/tblEmp.constants";
import { markVisibleColumnsInitialized } from "@/framework/cadastro/tables/empColumnLayout";
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
import { buildScopedTempFilterStorageKey } from "@/shared/preferences/userPreferencesScope";
import {
  readEmpPreferencesJson,
  readEmpPreferencesText,
  withEmpPreferencesCacheBatch,
  writeEmpPreferencesJson,
  writeEmpPreferencesText,
  hasScopedPreferenceValue,
} from "@/modules/empresas/preferences/empresasPreferencesCache";
import {
  canApplyRemotePreferenceSection,
  inferPreferenceSectionFromReason,
  markEmpPreferencesSectionDirty,
} from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import { normalizeEmpListViewMode } from "@/framework/mak/layout/mgViewMode.js";

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
export const EMP_FILTER_OPERATORS_KEY = "emp_filter_operators_v1";

const LISTAGEM_DOCUMENT_VERSION = 2;

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

const toObject = (value, fallback = {}) =>
  value && typeof value === "object" && !Array.isArray(value) ? value : fallback;

const TEMP_FILTERS_FALLBACK = {};

export const getEmpresasTempFilterStorageKey = () => buildScopedTempFilterStorageKey();

export const readStoredTempListagemFilters = () =>
  toObject(readEmpPreferencesJson(getEmpresasTempFilterStorageKey(), TEMP_FILTERS_FALLBACK), {});

export const writeStoredTempListagemFilters = (filters) =>
  writeEmpPreferencesJson(getEmpresasTempFilterStorageKey(), toObject(filters, {}), {
    reason: "listagem:temp-filters",
  });

export const clearStoredTempListagemFilters = () =>
  writeStoredTempListagemFilters(TEMP_FILTERS_FALLBACK);

export const readStoredFilterOperators = () =>
  toObject(readEmpPreferencesJson(EMP_FILTER_OPERATORS_KEY, {}), {});

export const writeStoredFilterOperators = (operatorsByField = {}) =>
  writeEmpPreferencesJson(EMP_FILTER_OPERATORS_KEY, toObject(operatorsByField, {}), {
    reason: "listagem:filter-operators",
  });

const readStorage = (key) => readEmpPreferencesText(key, null);

const writeStorage = (key, value, reason = "listagem:update") => {
  if (value == null) return false;
  const changed = writeEmpPreferencesText(key, value, { reason });
  if (changed) {
    const section = inferPreferenceSectionFromReason(reason);
    if (section) markEmpPreferencesSectionDirty(section);
  }
  return changed;
};

const normalizeViewMode = (value) =>
  normalizeEmpListViewMode(value, { allowRecord: true });

const normalizeLaunchPanelStyle = (value) => (value === "sidebar" ? "sidebar" : "tabs");

const sanitizeTablePreferences = (table = {}) => {
  const next = { ...table };
  FORBIDDEN_TABLE_KEYS.forEach((key) => {
    if (key in next) delete next[key];
  });
  return next;
};

export const readStoredEmpViewMode = () =>
  normalizeEmpListViewMode(readStorage(EMP_VIEW_MODE_STORAGE_KEY), { allowRecord: false });

export const writeStoredEmpViewMode = (mode, reason = "listagem:view-mode") => {
  writeStorage(EMP_VIEW_MODE_STORAGE_KEY, normalizeViewMode(mode), reason);
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("emp-view-mode-updated"));
  }
};

export const readStoredLaunchPanelStyle = () =>
  normalizeLaunchPanelStyle(readStorage(EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY));

export const writeStoredLaunchPanelStyle = (style, reason = "form-layout:panel-style-local") => {
  writeStorage(
    EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY,
    normalizeLaunchPanelStyle(style),
    reason
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

const LISTAGEM_SCOPED_FIELD_KEYS = [
  VISIBLE_KEY,
  ORDER_KEY,
  WIDTHS_KEY,
  FILTERS_KEY,
  SORT_KEY,
  EMP_VIEW_MODE_STORAGE_KEY,
  EMP_CARDS_LAYOUT_KEY,
  EMP_SEARCH_VIS_KEY,
  EMP_FILTER_FIELDS_LAYOUT_KEY,
  EMP_FILTER_OPERATORS_KEY,
];

export const hasScopedListagemPreferences = () =>
  LISTAGEM_SCOPED_FIELD_KEYS.some((fieldKey) => hasScopedPreferenceValue(fieldKey));

export const buildListagemPreferencesFromStorage = () => {
  const table = sanitizeTablePreferences({
    columnOrder: safeParseJson(readStorage(ORDER_KEY), []),
    visibleColumns: safeParseJson(readStorage(VISIBLE_KEY), []),
    columnWidths: safeParseJson(readStorage(WIDTHS_KEY), {}),
    columnSizingMode: safeParseJson(readStorage(SIZING_MODE_KEY), {}),
    frozenLeftColumnCount: Number(readStorage(FROZEN_KEY) || 0) || 0,
    sort: safeParseJson(readStorage(SORT_KEY), [{ key: "codempresa", direction: "asc" }]),
    pageSize: Number(readStorage(PAGE_SIZE_KEY) || 100) || 100,
    aggregationConfig: safeParseJson(readStorage(AGGR_KEY), {}),
    loadBatchSize: Number(readStorage(EMP_LOAD_BATCH_STORAGE_KEY) || 100) || 100,
  });

  const visibleCardsRaw = readStorage(EMP_SEARCH_VIS_KEY) || readStorage(EMP_SEARCH_VIS_KEY_LEGACY);

  return {
    version: LISTAGEM_DOCUMENT_VERSION,
    table,
    cards: {
      visibleFields: safeParseJson(visibleCardsRaw, {}),
      fieldOrder: Object.keys(safeParseJson(visibleCardsRaw, {}) || {}),
      cardsPerRow: Number(
        safeParseJson(readStorage(EMP_CARDS_LAYOUT_KEY), { cardsPerRow: 3 })?.cardsPerRow || 3
      ),
      layoutConfig: safeParseJson(readStorage(EMP_CARDS_LAYOUT_KEY), { cardsPerRow: 3 }),
      density: "normal",
    },
    filtersConfig: {
      filterFieldsLayout: safeParseJson(readStorage(EMP_FILTER_FIELDS_LAYOUT_KEY), {
        visiveis: [],
        ordem: [],
        maxVisible: DEFAULT_FILTER_MAX_VISIBLE,
      }),
      maxVisibleFields:
        Number(readStorage(FILTER_MAX_VISIBLE_KEY) || DEFAULT_FILTER_MAX_VISIBLE) ||
        DEFAULT_FILTER_MAX_VISIBLE,
      operatorsByField: readStoredFilterOperators(),
      dropdownVisibleFields: safeParseJson(readStorage(EMP_SEARCH_DROPDOWN_VIS_KEY), {}),
      favorites: safeParseJson(readStorage(EMP_SEARCH_FAV_KEY), []),
    },
    view: {
      mode: readStoredEmpViewMode(),
      launchPanelStyle: readStoredLaunchPanelStyle(),
    },
    meta: {
      revision: 0,
      updatedAt: null,
    },
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

export const applyListagemPreferencesToStorage = (preferences = {}, options = {}) => {
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
    if (respectDirtySections && !canApplyRemotePreferenceSection(section)) return false;
    if (skipUnchangedSections && stableJsonEqual(nextSlice ?? null, currentSlice ?? null)) {
      return false;
    }
    return true;
  };

  const shouldPreserveLocalTableStorage = (storageKey, remoteValue, { compare = (left, right) => left === right } = {}) => {
    if (!respectDirtySections || !hasScopedPreferenceValue(storageKey)) return false;
    const localRaw = readStorage(storageKey);
    if (localRaw == null) return false;
    if (compare(localRaw, remoteValue)) return false;
    markEmpPreferencesSectionDirty("table");
    return true;
  };

  withEmpPreferencesCacheBatch(() => {
    if (
      normalized.view.mode &&
      shouldApplySection("view", { mode: normalized.view.mode }, { mode: current.view?.mode })
    ) {
      const remoteMode = normalizeViewMode(normalized.view.mode);
      const localMode = normalizeViewMode(readStorage(EMP_VIEW_MODE_STORAGE_KEY));
      if (respectDirtySections && localMode && remoteMode !== localMode) {
        markEmpPreferencesSectionDirty("view");
      } else if (writeStorage(EMP_VIEW_MODE_STORAGE_KEY, remoteMode, reason)) {
        visualChange = true;
      }
    }

    if (
      normalized.view.launchPanelStyle &&
      shouldApplySection(
        "view",
        { launchPanelStyle: normalized.view.launchPanelStyle },
        { launchPanelStyle: current.view?.launchPanelStyle }
      )
    ) {
      if (
        writeStorage(
          EMP_LAUNCH_PANEL_STYLE_STORAGE_KEY,
          normalizeLaunchPanelStyle(normalized.view.launchPanelStyle),
          reason
        )
      ) {
        visualChange = true;
      }
    }

    const table = /** @type {any} */ (sanitizeTablePreferences(normalized.table || {}));
    if (shouldApplySection("table", table, current.table)) {
      if (table.columnOrder && writeStorage(ORDER_KEY, safeStringify(table.columnOrder), reason)) {
        visualChange = true;
      }
      if (table.visibleColumns) {
        if (writeStorage(VISIBLE_KEY, safeStringify(table.visibleColumns), reason)) {
          visualChange = true;
        }
        markVisibleColumnsInitialized();
      }
      if (
        table.columnWidths &&
        !shouldPreserveLocalTableStorage(WIDTHS_KEY, safeStringify(table.columnWidths), {
          compare: (left, right) => stableJsonEqual(safeParseJson(left, {}), safeParseJson(right, {})),
        }) &&
        writeStorage(WIDTHS_KEY, safeStringify(table.columnWidths), reason)
      ) {
        visualChange = true;
      }
      if (
        table.columnSizingMode &&
        !shouldPreserveLocalTableStorage(SIZING_MODE_KEY, safeStringify(table.columnSizingMode), {
          compare: (left, right) =>
            stableJsonEqual(safeParseJson(left, {}), safeParseJson(right, {})),
        }) &&
        writeStorage(SIZING_MODE_KEY, safeStringify(table.columnSizingMode), reason)
      ) {
        visualChange = true;
      }
      if (table.frozenLeftColumnCount != null) {
        const remoteFrozen = String(Number(table.frozenLeftColumnCount) || 0);
        if (
          !shouldPreserveLocalTableStorage(FROZEN_KEY, remoteFrozen) &&
          writeStorage(FROZEN_KEY, remoteFrozen, reason)
        ) {
          visualChange = true;
        }
      }
      if (
        table.sort &&
        !shouldPreserveLocalTableStorage(SORT_KEY, safeStringify(table.sort), {
          compare: (left, right) => stableJsonEqual(safeParseJson(left, []), safeParseJson(right, [])),
        }) &&
        writeStorage(SORT_KEY, safeStringify(table.sort), reason)
      ) {
        visualChange = true;
      }
      if (table.pageSize != null) {
        if (writeStorage(PAGE_SIZE_KEY, String(Number(table.pageSize) || 100), reason)) {
          visualChange = true;
        }
      }
      if (table.aggregationConfig) {
        if (writeStorage(AGGR_KEY, safeStringify(table.aggregationConfig), reason)) {
          visualChange = true;
        }
      }
      if (table.loadBatchSize != null) {
        if (
          writeStorage(
            EMP_LOAD_BATCH_STORAGE_KEY,
            String(Number(table.loadBatchSize) || 100),
            reason
          )
        ) {
          visualChange = true;
        }
      }
    }

    const filtersConfig = toObject(normalized.filtersConfig, {});
    if (shouldApplySection("filtersConfig", filtersConfig, current.filtersConfig)) {
      if (filtersConfig.filterFieldsLayout) {
        if (
          writeStorage(
            EMP_FILTER_FIELDS_LAYOUT_KEY,
            safeStringify(filtersConfig.filterFieldsLayout),
            reason
          )
        ) {
          visualChange = true;
        }
        if (filtersConfig.filterFieldsLayout.maxVisible != null) {
          if (
            writeStorage(
              FILTER_MAX_VISIBLE_KEY,
              String(
                Number(filtersConfig.filterFieldsLayout.maxVisible) || DEFAULT_FILTER_MAX_VISIBLE
              ),
              reason
            )
          ) {
            visualChange = true;
          }
        }
      }
      if (filtersConfig.maxVisibleFields != null) {
        if (
          writeStorage(
            FILTER_MAX_VISIBLE_KEY,
            String(Number(filtersConfig.maxVisibleFields) || DEFAULT_FILTER_MAX_VISIBLE),
            reason
          )
        ) {
          visualChange = true;
        }
      }
      if (filtersConfig.dropdownVisibleFields) {
        if (
          writeStorage(
            EMP_SEARCH_DROPDOWN_VIS_KEY,
            safeStringify(filtersConfig.dropdownVisibleFields),
            reason
          )
        ) {
          visualChange = true;
        }
      }
      if (filtersConfig.favorites) {
        if (writeStorage(EMP_SEARCH_FAV_KEY, safeStringify(filtersConfig.favorites), reason)) {
          visualChange = true;
        }
      }
      if (filtersConfig.operatorsByField) {
        if (
          writeStorage(
            EMP_FILTER_OPERATORS_KEY,
            safeStringify(toObject(filtersConfig.operatorsByField, {})),
            reason
          )
        ) {
          visualChange = true;
        }
      }
    }

    if (shouldApplySection("cards", normalized.cards, current.cards)) {
      if (normalized.cards?.visibleFields) {
        const visibleFields = toObject(normalized.cards.visibleFields, {});
        const fieldOrder = Array.isArray(normalized.cards.fieldOrder)
          ? normalized.cards.fieldOrder.map((key) => String(key || "").trim()).filter(Boolean)
          : Object.keys(visibleFields);
        const orderedVisible = {};
        fieldOrder.forEach((key) => {
          if (key in visibleFields) orderedVisible[key] = visibleFields[key];
        });
        Object.keys(visibleFields).forEach((key) => {
          if (!(key in orderedVisible)) orderedVisible[key] = visibleFields[key];
        });
        if (writeStorage(EMP_SEARCH_VIS_KEY, safeStringify(orderedVisible), reason)) {
          visualChange = true;
        }
      }
      if (normalized.cards?.layoutConfig || normalized.cards?.cardsPerRow) {
        if (
          writeStorage(
            EMP_CARDS_LAYOUT_KEY,
            safeStringify(
              normalized.cards.layoutConfig || {
                cardsPerRow: Number(normalized.cards.cardsPerRow) || 3,
              }
            ),
            reason
          )
        ) {
          visualChange = true;
        }
      }
    }
  }, reason.includes("hydrate") ? "bootstrap:apply-listagem" : "remote:apply-listagem");

  if (visualChange) {
    if (normalized.view?.mode) {
      window.dispatchEvent(new CustomEvent("emp-view-mode-updated"));
    }
    window.dispatchEvent(new CustomEvent("emp-column-layout-updated"));
    window.dispatchEvent(new CustomEvent("emp-filter-fields-layout-updated"));
    window.dispatchEvent(new CustomEvent("emp-favorites-updated"));
  }

  return visualChange;
};

export const applyRemoteListagemPreferencesToStorage = (preferences = {}) =>
  applyListagemPreferencesToStorage(preferences, {
    respectDirtySections: true,
    skipUnchangedSections: true,
    reason: "listagem:remote-sync",
  });

export const applyListagemPreferencesPatchToStorage = (patch = {}) => {
  const normalizedPatch = normalizeListagemDocument(patch);
  applyListagemPreferencesToStorage(normalizedPatch);
};

export const buildFormLayoutPreferencesFromStorage = (userId, clienteId) => {
  if (!userId || typeof window === "undefined") return null;
  const { layoutKey } = getLayoutStorageKeysForModule(empresasCadastroConfig, userId, clienteId);
  const parsedLayout = readEmpPreferencesJson(layoutKey, null);
  if (!parsedLayout || typeof parsedLayout !== "object") return null;
  return {
    version: 3,
    activeConfig: parsedLayout,
  };
};

export const applyFormLayoutPreferencesToStorage = (userId, preferences, updatedAt, clienteId, revision = null) => {
  if (!userId || typeof window === "undefined") return;
  const { layoutKey } = getLayoutStorageKeysForModule(empresasCadastroConfig, userId, clienteId);
  const activeConfig =
    preferences && typeof preferences === "object" && preferences.activeConfig
      ? preferences.activeConfig
      : preferences;
  if (!activeConfig || typeof activeConfig !== "object") return;
  const nextConfigJson = stableStringify(activeConfig);
  const currentConfigJson = stableStringify(readEmpPreferencesJson(layoutKey, null));
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
    writeEmpPreferencesText(`${layoutKey}__serverUpdatedAt`, nextUpdatedAt, {
      reason: "form-layout:hydrate",
    });
    if (Number.isFinite(Number(revision))) {
      writeEmpPreferencesText(`${layoutKey}__serverRevision`, String(Number(revision)), {
        reason: "form-layout:hydrate",
      });
    }
    if (nextConfigJson) {
      writeEmpPreferencesText(`${layoutKey}__serverHash`, nextConfigJson, {
        reason: "form-layout:hydrate",
      });
    }
  }, "bootstrap:apply-form");
  window.dispatchEvent(new Event("cadastro-layout-updated:empresas"));
  window.dispatchEvent(
    new CustomEvent("cadastro-layout-hydrated:empresas", {
      detail: { userId, clienteId, moduleId: "empresas" },
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


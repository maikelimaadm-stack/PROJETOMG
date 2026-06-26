/**
 * Hooks genéricos de layout de pesquisa/cards/filtros — config-driven via searchView.
 */
import { useCallback, useEffect, useMemo, useState } from "react";
import { useModeloBase1Config } from "@/ModeloBase1/config";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import { useModeloBase1CustomFields } from "./useModeloBase1CustomFields.js";

const shouldRefreshByReason = (reason, keywords = []) => {
  const normalized = String(reason ?? "").toLowerCase();
  if (!normalized) return false;
  if (normalized.includes("listagem")) return true;
  return keywords.some((keyword) => normalized.includes(keyword));
};

const shouldRefreshByStorageKeys = (keys, targetKey) => {
  const keyList = Array.isArray(keys) ? keys : [keys];
  const normalizedTarget = String(targetKey ?? "").toLowerCase();
  return keyList.some((key) => String(key ?? "").toLowerCase().includes(normalizedTarget));
};

function useSearchViewStorageReload({ adapter, storageKey, onReload, refreshKeywords = [], bootstrapEvent }) {
  useEffect(() => {
    onReload();
    const unsubscribe = adapter?.subscribe?.((detail) => {
      const reason = detail?.reason ?? "";
      if (shouldRefreshByReason(reason, refreshKeywords)) {
        onReload();
        return;
      }
      if (String(reason).toLowerCase() === "storage" && shouldRefreshByStorageKeys(detail?.keys, storageKey)) {
        onReload();
      }
    });
    const onBootstrap = () => onReload();
    if (bootstrapEvent) window.addEventListener(bootstrapEvent, onBootstrap);
    return () => {
      unsubscribe?.();
      if (bootstrapEvent) window.removeEventListener(bootstrapEvent, onBootstrap);
    };
  }, [adapter, storageKey, onReload, refreshKeywords, bootstrapEvent]);
}

/** Campos visíveis no dropdown de pesquisa da toolbar. */
export function useModeloBase1SearchDropdownFields() {
  const config = useModeloBase1Config();
  const searchView = config.searchView ?? {};
  const adapter = config.preferencesAdapter;
  const bootstrapEvent = adapter?.bootstrapAppliedEvent;
  const visKey = searchView.dropdownVisKey ?? `${config.moduleId}_search_dropdown_vis`;
  const defaultFields = searchView.defaultFields ?? [];
  const buildCatalog = searchView.buildCardCatalog ?? (() => []);
  const sortFields = searchView.sortCardFieldsAlphabetically ?? ((fields) => fields);
  const mergeVis = searchView.mergeSearchVisFields ?? ((catalog, vis) => (vis?.length ? vis : catalog));
  const loadVis = searchView.loadSearchDropdownVisFields ?? ((catalog) => catalog);
  const saveVis = searchView.saveSearchDropdownVisFields ?? (() => {});
  const buildDetail = searchView.buildSearchDropdownDetailFields ?? ((catalog) => catalog);
  const getDefaults = searchView.getDefaultCardVisFields ?? ((catalog) => catalog);

  const { data: customFields = [] } = useModeloBase1CustomFields();
  const catalog = useMemo(
    () => sortFields(buildCatalog(customFields)),
    [buildCatalog, customFields, sortFields]
  );

  const [visFields, setVisFields] = useState(() => loadVis(defaultFields));

  const reload = useCallback(() => {
    const sourceCatalog = catalog.length > 0 ? catalog : defaultFields;
    setVisFields((current) => {
      const next = loadVis(sourceCatalog);
      return stableJsonEqual(current, next) ? current : next;
    });
  }, [catalog, defaultFields, loadVis]);

  useSearchViewStorageReload({
    adapter,
    storageKey: visKey,
    onReload: reload,
    refreshKeywords: ["dropdown-fields"],
    bootstrapEvent,
  });

  const configFields = useMemo(() => {
    const merged = mergeVis(catalog, visFields.length > 0 ? visFields : catalog);
    return sortFields(merged);
  }, [catalog, visFields, mergeVis, sortFields]);

  const detailFields = useMemo(() => buildDetail(catalog, visFields), [catalog, visFields, buildDetail]);

  const saveConfig = useCallback(
    (nextFields) => {
      const normalized = mergeVis(catalog, nextFields).map((field) => {
        const fallback =
          catalog.find((item) => item.key === field.key) ||
          defaultFields.find((item) => item.key === field.key);
        return { ...fallback, ...field };
      });
      setVisFields(normalized);
      saveVis(normalized);
    },
    [catalog, defaultFields, mergeVis, saveVis]
  );

  const getRestoreDefaults = useCallback(
    () => sortFields(getDefaults(catalog)),
    [catalog, getDefaults, sortFields]
  );

  return { configFields, detailFields, saveConfig, getRestoreDefaults };
}

/** Campos visíveis nos cards de pesquisa + layout de grid. */
export function useModeloBase1CardsVisFields() {
  const config = useModeloBase1Config();
  const searchView = config.searchView ?? {};
  const adapter = config.preferencesAdapter;
  const bootstrapEvent = adapter?.bootstrapAppliedEvent;
  const visKey = searchView.cardsVisKey ?? `${config.moduleId}_cards_vis`;
  const layoutKey = searchView.cardsLayoutKey ?? `${config.moduleId}_cards_layout`;
  const defaultFields = searchView.defaultFields ?? [];
  const layoutDefault = searchView.cardsLayoutDefault ?? { cardsPerRow: 3 };
  const buildCatalog = searchView.buildCardCatalog ?? (() => []);
  const mergeVis = searchView.mergeSearchVisFields ?? ((catalog, vis) => (vis?.length ? vis : catalog));
  const loadVis = searchView.loadSearchVisFields ?? ((catalog) => catalog);
  const saveVis = searchView.saveSearchVisFields ?? (() => {});
  const loadLayout = searchView.loadCardsLayoutConfig ?? (() => ({ ...layoutDefault }));
  const saveLayoutStorage = searchView.saveCardsLayoutConfig ?? (() => {});
  const getFieldsPerRow = searchView.getFieldsPerRowForLayout ?? (() => 1);
  const sortByOrder = searchView.sortCardConfigFieldsByOrder ?? ((fields) => fields);
  const loadFieldOrder = searchView.loadCardFieldOrder ?? (() => []);
  const getDefaults = searchView.getDefaultCardVisFields ?? ((catalog) => catalog);
  const sortAlpha = searchView.sortCardFieldsAlphabetically ?? ((fields) => fields);

  const { data: customFields = [] } = useModeloBase1CustomFields();
  const catalog = useMemo(() => buildCatalog(customFields), [buildCatalog, customFields]);

  const [visFields, setVisFields] = useState(() => loadVis(defaultFields));
  const [layoutConfig, setLayoutConfig] = useState(() => loadLayout());

  const reload = useCallback(() => {
    const sourceCatalog = catalog.length > 0 ? catalog : defaultFields;
    setVisFields((current) => {
      const next = loadVis(sourceCatalog);
      return stableJsonEqual(current, next) ? current : next;
    });
    setLayoutConfig((current) => {
      const next = loadLayout();
      return stableJsonEqual(current, next) ? current : next;
    });
  }, [catalog, defaultFields, loadVis, loadLayout]);

  useSearchViewStorageReload({
    adapter,
    storageKey: visKey,
    onReload: reload,
    refreshKeywords: ["cards"],
    bootstrapEvent,
  });

  const fieldsPerRow = useMemo(
    () => getFieldsPerRow(layoutConfig.cardsPerRow),
    [layoutConfig.cardsPerRow, getFieldsPerRow]
  );

  const configFields = useMemo(() => {
    const merged = mergeVis(catalog, visFields.length > 0 ? visFields : catalog);
    return sortByOrder(merged, loadFieldOrder());
  }, [catalog, visFields, mergeVis, sortByOrder, loadFieldOrder]);

  const detailFields = useMemo(
    () => searchView.buildSearchDropdownDetailFields?.(catalog, visFields) ?? catalog,
    [catalog, visFields, searchView]
  );

  const saveConfig = useCallback(
    (nextFields) => {
      const normalized = mergeVis(catalog, nextFields).map((field) => {
        const fallback =
          catalog.find((item) => item.key === field.key) ||
          defaultFields.find((item) => item.key === field.key);
        return { ...fallback, ...field };
      });
      const ordered = nextFields
        .map((field) => normalized.find((item) => item.key === field.key))
        .filter(Boolean);
      const remaining = normalized.filter((field) => !ordered.some((item) => item.key === field.key));
      setVisFields([...ordered, ...remaining]);
      saveVis([...ordered, ...remaining]);
    },
    [catalog, defaultFields, mergeVis, saveVis]
  );

  const getRestoreDefaults = useCallback(
    () => sortAlpha(getDefaults(catalog)),
    [catalog, getDefaults, sortAlpha]
  );

  const saveLayoutConfig = useCallback(
    (nextConfig) => {
      const normalized = searchView.normalizeCardsPerRow
        ? { cardsPerRow: searchView.normalizeCardsPerRow(nextConfig?.cardsPerRow) }
        : { cardsPerRow: nextConfig?.cardsPerRow ?? layoutDefault.cardsPerRow };
      setLayoutConfig(normalized);
      saveLayoutStorage(normalized);
    },
    [layoutDefault.cardsPerRow, saveLayoutStorage, searchView]
  );

  const getRestoreLayoutDefaults = useCallback(() => ({ ...layoutDefault }), [layoutDefault]);

  return {
    configFields,
    detailFields,
    visFields,
    layoutConfig,
    fieldsPerRow,
    saveConfig,
    getRestoreDefaults,
    saveLayoutConfig,
    getRestoreLayoutDefaults,
  };
}

/** Layout de campos do painel de filtros. */
export function useModeloBase1FilterFieldsLayout(catalogFields = []) {
  const config = useModeloBase1Config();
  const searchView = config.searchView ?? {};
  const adapter = config.preferencesAdapter;
  const bootstrapEvent = adapter?.bootstrapAppliedEvent;
  const layoutKey = searchView.filterFieldsLayoutKey ?? `${config.moduleId}_filter_fields_layout`;
  const updatedEvent = searchView.filterFieldsLayoutUpdatedEvent ?? `${config.moduleId}-filter-fields-layout-updated`;
  const loadLayout = searchView.loadFilterFieldsLayout ?? (() => ({ visiveis: [], ordem: [] }));
  const saveLayoutStorage = searchView.saveFilterFieldsLayout ?? (() => {});
  const applyLayout = searchView.applyFilterFieldsLayout ?? ((fields) => fields);
  const getDefaults = searchView.getDefaultFilterFieldsLayout ?? (() => ({ visiveis: [], ordem: [] }));
  const mergeVisible = searchView.mergeSavedVisibleFilterFields ?? ((vis, keys) => vis);
  const mergeOrder = searchView.mergeSavedFilterFieldOrder ?? ((ordem, keys) => ordem);

  const catalogKeys = useMemo(
    () => catalogFields.map((field) => field.key).filter(Boolean),
    [catalogFields]
  );
  const catalogKey = useMemo(() => catalogKeys.join("|"), [catalogKeys]);

  const [layout, setLayout] = useState(() => loadLayout(catalogKeys));

  const reload = useCallback(() => {
    const keys = catalogKey ? catalogKey.split("|") : [];
    setLayout((current) => {
      const next = loadLayout(keys);
      return stableJsonEqual(current, next) ? current : next;
    });
  }, [catalogKey, loadLayout]);

  useEffect(() => {
    reload();
    const unsubscribe = adapter?.subscribe?.((detail) => {
      const reason = String(detail?.reason ?? "").toLowerCase();
      if (
        shouldRefreshByReason(reason, [
          "filter-layout",
          "filter-operators",
          "dropdown-fields",
          "favorites",
        ])
      ) {
        reload();
      }
      if (reason === "storage" && shouldRefreshByStorageKeys(detail?.keys, layoutKey)) {
        reload();
      }
    });
    const onDom = () => reload();
    window.addEventListener(updatedEvent, onDom);
    if (bootstrapEvent) window.addEventListener(bootstrapEvent, onDom);
    return () => {
      unsubscribe?.();
      window.removeEventListener(updatedEvent, onDom);
      if (bootstrapEvent) window.removeEventListener(bootstrapEvent, onDom);
    };
  }, [adapter, bootstrapEvent, layoutKey, reload, updatedEvent]);

  const filterFields = useMemo(
    () => applyLayout(catalogFields, layout),
    [catalogFields, layout, applyLayout]
  );

  const saveLayout = useCallback(
    ({ visiveis, ordem }) => {
      const nextLayout = {
        visiveis: mergeVisible(visiveis, catalogKeys),
        ordem: mergeOrder(ordem, catalogKeys),
      };
      setLayout(nextLayout);
      saveLayoutStorage(nextLayout);
    },
    [catalogKeys, mergeVisible, mergeOrder, saveLayoutStorage]
  );

  const getRestoreDefaults = useCallback(
    () => getDefaults(catalogKeys),
    [catalogKeys, getDefaults]
  );

  return {
    filterFields,
    layout,
    saveLayout,
    getRestoreDefaults,
    catalogFields,
  };
}

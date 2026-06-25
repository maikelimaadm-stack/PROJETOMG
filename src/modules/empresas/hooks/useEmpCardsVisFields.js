import { useCallback, useEffect, useLayoutEffect, useMemo, useState } from "react";
import {
  EMP_CARDS_LAYOUT_KEY,
  EMP_SEARCH_VIS_KEY,
  EMP_SEARCH_VIS_KEY_LEGACY,
  EMP_SEARCH_DEFAULT_FIELDS,
  buildCardCatalogFromColumnsInUse,
  buildCardDetailFieldsFromColumns,
  EMP_CARDS_LAYOUT_DEFAULT,
  getDefaultCardVisFields,
  getFieldsPerRowForLayout,
  loadCardsLayoutConfig,
  loadSearchVisFields,
  mergeSearchVisFields,
  normalizeCardsPerRow,
  saveCardsLayoutConfig,
  saveSearchVisFields,
  sortCardConfigFieldsAlphabetically,
  sortCardConfigFieldsByOrder,
  loadCardFieldOrder,
} from "@/modules/empresas/components/empSearchView.constants";
import { getColumnsInUse } from "@/modules/empresas/utils/empTableColumnCatalog";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { subscribeEmpPreferencesCache, isSameTabEmpPreferencesWrite, isLocalListagemPreferenceWrite } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import { markEmpPreferencesPerf } from "@/modules/empresas/preferences/empresasPreferencesPerfMarks";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";

const shouldRefreshCardsByCacheEvent = ({ reason = "", keys = [] } = {}) => {
  const normalizedReason = String(reason || "").toLowerCase();
  if (!normalizedReason) return false;
  if (normalizedReason.includes("cards")) return true;
  if (normalizedReason.includes("listagem:hydrate")) return true;
  if (normalizedReason === "storage") {
    const keyList = Array.isArray(keys) ? keys : [keys];
    return keyList.some((key) => {
      const normalizedKey = String(key || "").toLowerCase();
      return (
        normalizedKey.includes(EMP_SEARCH_VIS_KEY.toLowerCase()) ||
        normalizedKey.includes(EMP_SEARCH_VIS_KEY_LEGACY.toLowerCase()) ||
        normalizedKey.includes(EMP_CARDS_LAYOUT_KEY.toLowerCase())
      );
    });
  }
  return false;
};

export function useEmpCardsVisFields() {
  const [columnLayoutVersion, setColumnLayoutVersion] = useState(0);
  const [preferencesVersion, setPreferencesVersion] = useState(0);

  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();

  useEffect(() => {
    const refreshColumns = () => setColumnLayoutVersion((current) => current + 1);
    const refreshPreferences = () => setPreferencesVersion((current) => current + 1);
    const unsubscribeCache = subscribeEmpPreferencesCache((detail = {}) => {
      const { reason } = detail;
      const normalized = String(reason || "").toLowerCase();
      if (
        (normalized.includes("listagem:hydrate") || normalized.includes("remote-sync")) &&
        isEmpPreferencesSectionDirty("cards")
      ) {
        return;
      }
      if (
        shouldRefreshCardsByCacheEvent(detail) &&
        isSameTabEmpPreferencesWrite(detail) &&
        (isEmpPreferencesSectionDirty("cards") || isLocalListagemPreferenceWrite(reason))
      ) {
        return;
      }
      if (shouldRefreshCardsByCacheEvent(detail)) refreshPreferences();
      if (String(reason || "").includes("table")) refreshColumns();
    });
    const onBootstrapApplied = () => refreshPreferences();
    window.addEventListener("emp-column-layout-updated", refreshColumns);
    window.addEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onBootstrapApplied);
    return () => {
      unsubscribeCache();
      window.removeEventListener("emp-column-layout-updated", refreshColumns);
      window.removeEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onBootstrapApplied);
    };
  }, []);

  const columnsForCards = useMemo(() => {
    void columnLayoutVersion;
    const { disponiveis } = getColumnsInUse(camposPersonalizados);
    return Array.isArray(disponiveis) ? disponiveis : [];
  }, [camposPersonalizados, columnLayoutVersion]);

  const catalog = useMemo(
    () => buildCardCatalogFromColumnsInUse(columnsForCards),
    [columnsForCards]
  );

  const [visFields, setVisFields] = useState(() => {
    markEmpPreferencesPerf("PREF_LOCAL_SNAPSHOT_READ", {
      section: "cards",
      source: "local",
    });
    const fields = loadSearchVisFields(EMP_SEARCH_DEFAULT_FIELDS);
    markEmpPreferencesPerf("PREF_CARDS_INITIAL_STATE", {
      section: "cards",
      source: "local",
      changed: true,
    });
    return fields;
  });
  const [layoutConfig, setLayoutConfig] = useState(() => loadCardsLayoutConfig());

  useLayoutEffect(() => {
    if (preferencesVersion === 0) return;
    const sourceCatalog = catalog.length > 0 ? catalog : EMP_SEARCH_DEFAULT_FIELDS;
    const nextVisFields = loadSearchVisFields(sourceCatalog);
    const nextLayout = loadCardsLayoutConfig();
    setVisFields((current) => (stableJsonEqual(current, nextVisFields) ? current : nextVisFields));
    setLayoutConfig((current) => (stableJsonEqual(current, nextLayout) ? current : nextLayout));
  }, [preferencesVersion, catalog]);

  const fieldsPerRow = useMemo(
    () => getFieldsPerRowForLayout(layoutConfig.cardsPerRow),
    [layoutConfig.cardsPerRow]
  );

  useEffect(() => {
    if (catalog.length === 0) return;
    setVisFields((current) => {
      const merged = mergeSearchVisFields(catalog, current);
      return stableJsonEqual(current, merged) ? current : merged;
    });
  }, [catalog]);

  const configFields = useMemo(() => {
    const merged = mergeSearchVisFields(
      catalog,
      visFields.length > 0 ? visFields : catalog
    );
    return sortCardConfigFieldsByOrder(merged, loadCardFieldOrder());
  }, [catalog, visFields]);

  const detailFields = useMemo(
    () => buildCardDetailFieldsFromColumns(columnsForCards, configFields),
    [columnsForCards, configFields]
  );

  const saveConfig = useCallback(
    (nextFields) => {
      markEmpPreferencesPerf("PREF_USER_ACTION", { section: "cards", source: "user_action" });
      const normalized = mergeSearchVisFields(catalog, nextFields).map((field) => {
        const fallback =
          catalog.find((item) => item.key === field.key) ||
          EMP_SEARCH_DEFAULT_FIELDS.find((item) => item.key === field.key);
        return { ...fallback, ...field };
      });
      const ordered = nextFields
        .map((field) => normalized.find((item) => item.key === field.key))
        .filter(Boolean);
      const remaining = normalized.filter(
        (field) => !ordered.some((item) => item.key === field.key)
      );
      const finalFields = [...ordered, ...remaining];
      setVisFields(finalFields);
      markEmpPreferencesPerf("PREF_UI_STATE_CHANGED", {
        section: "cards",
        source: "user_action",
        changed: true,
      });
      saveSearchVisFields(finalFields);
      markEmpPreferencesPerf("PREF_LOCAL_WRITE", {
        section: "cards",
        source: "user_action",
        dirty: true,
      });
    },
    [catalog]
  );

  const getRestoreDefaults = useCallback(
    () => sortCardConfigFieldsAlphabetically(getDefaultCardVisFields(catalog)),
    [catalog]
  );

  const saveLayoutConfig = useCallback((nextConfig) => {
    markEmpPreferencesPerf("PREF_USER_ACTION", { section: "cards", source: "user_action" });
    const normalized = { cardsPerRow: normalizeCardsPerRow(nextConfig?.cardsPerRow) };
    setLayoutConfig(normalized);
    markEmpPreferencesPerf("PREF_UI_STATE_CHANGED", {
      section: "cards",
      source: "user_action",
      changed: true,
    });
    saveCardsLayoutConfig(normalized);
    markEmpPreferencesPerf("PREF_LOCAL_WRITE", {
      section: "cards",
      source: "user_action",
      dirty: true,
    });
  }, []);

  const getRestoreLayoutDefaults = useCallback(() => ({ ...EMP_CARDS_LAYOUT_DEFAULT }), []);

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

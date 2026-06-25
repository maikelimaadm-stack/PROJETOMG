import { useCallback, useEffect, useMemo, useState } from "react";
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
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { isEmpPreferencesSectionDirty } from "@/modules/empresas/preferences/empresasPreferencesScopeState";
import { stableJsonEqual } from "@/shared/utils/stableStringify";

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
      if (shouldRefreshCardsByCacheEvent(detail)) refreshPreferences();
      if (String(reason || "").includes("table")) refreshColumns();
    });
    window.addEventListener("emp-column-layout-updated", refreshColumns);
    return () => {
      unsubscribeCache();
      window.removeEventListener("emp-column-layout-updated", refreshColumns);
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

  const [visFields, setVisFields] = useState(() => loadSearchVisFields(EMP_SEARCH_DEFAULT_FIELDS));
  const [layoutConfig, setLayoutConfig] = useState(() => loadCardsLayoutConfig());

  useEffect(() => {
    const sourceCatalog = catalog.length > 0 ? catalog : EMP_SEARCH_DEFAULT_FIELDS;
    const nextVisFields = loadSearchVisFields(sourceCatalog);
    const nextLayout = loadCardsLayoutConfig();
    setVisFields((current) => (stableJsonEqual(current, nextVisFields) ? current : nextVisFields));
    setLayoutConfig((current) => (stableJsonEqual(current, nextLayout) ? current : nextLayout));
  }, [catalog, preferencesVersion]);

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
      saveSearchVisFields(finalFields);
    },
    [catalog]
  );

  const getRestoreDefaults = useCallback(
    () => sortCardConfigFieldsAlphabetically(getDefaultCardVisFields(catalog)),
    [catalog]
  );

  const saveLayoutConfig = useCallback((nextConfig) => {
    const normalized = { cardsPerRow: normalizeCardsPerRow(nextConfig?.cardsPerRow) };
    setLayoutConfig(normalized);
    saveCardsLayoutConfig(normalized);
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

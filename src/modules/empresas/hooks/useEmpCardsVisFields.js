import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMP_CARDS_LAYOUT_KEY,
  EMP_SEARCH_VIS_KEY,
  EMP_SEARCH_VIS_KEY_LEGACY,
  EMP_SEARCH_DEFAULT_FIELDS,
  buildEmpCardFieldCatalog,
  buildSearchDropdownDetailFields,
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
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";
import { shouldRefreshListagemHydrate } from "@/modules/empresas/preferences/empListagemSectionCacheEvents";

const shouldRefreshCardsByCacheEvent = ({ reason = "", keys = [] } = {}) => {
  const normalizedReason = String(reason || "").toLowerCase();
  if (!normalizedReason) return false;
  if (shouldRefreshListagemHydrate(normalizedReason)) return true;
  if (normalizedReason.includes("cards")) return true;
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

/** Mesmo padrão de useEmpSearchDropdownFields — catálogo completo com campos personalizados. */
export function useEmpCardsVisFields() {
  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();

  const catalog = useMemo(
    () => buildEmpCardFieldCatalog(camposPersonalizados),
    [camposPersonalizados]
  );

  const [visFields, setVisFields] = useState(() => loadSearchVisFields(EMP_SEARCH_DEFAULT_FIELDS));
  const [layoutConfig, setLayoutConfig] = useState(() => loadCardsLayoutConfig());

  useEffect(() => {
    const sourceCatalog = catalog.length > 0 ? catalog : EMP_SEARCH_DEFAULT_FIELDS;

    const reloadFromStorage = () => {
      setVisFields((current) => {
        const next = loadSearchVisFields(sourceCatalog);
        return stableJsonEqual(current, next) ? current : next;
      });
      setLayoutConfig((current) => {
        const next = loadCardsLayoutConfig();
        return stableJsonEqual(current, next) ? current : next;
      });
    };

    reloadFromStorage();

    const unsubscribe = subscribeEmpPreferencesCache((detail) => {
      if (!shouldRefreshCardsByCacheEvent(detail)) return;
      reloadFromStorage();
    });

    const onBootstrapApplied = () => reloadFromStorage();
    window.addEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onBootstrapApplied);

    return () => {
      unsubscribe();
      window.removeEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onBootstrapApplied);
    };
  }, [catalog]);

  const fieldsPerRow = useMemo(
    () => getFieldsPerRowForLayout(layoutConfig.cardsPerRow),
    [layoutConfig.cardsPerRow]
  );

  const configFields = useMemo(() => {
    const merged = mergeSearchVisFields(catalog, visFields.length > 0 ? visFields : catalog);
    return sortCardConfigFieldsByOrder(merged, loadCardFieldOrder());
  }, [catalog, visFields]);

  const detailFields = useMemo(
    () => buildSearchDropdownDetailFields(catalog, visFields),
    [catalog, visFields]
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

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  EMP_SEARCH_DROPDOWN_VIS_KEY,
  buildEmpCardFieldCatalog,
  buildSearchDropdownDetailFields,
  getDefaultCardVisFields,
  loadSearchDropdownVisFields,
  mergeSearchVisFields,
  saveSearchDropdownVisFields,
  sortCardConfigFieldsAlphabetically,
} from "@/modules/empresas/components/empSearchView.constants";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { stableJsonEqual } from "@/shared/utils/stableStringify";

import { shouldRefreshListagemHydrate } from "@/modules/empresas/preferences/empListagemSectionCacheEvents";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";

const shouldRefreshDropdownByCacheEvent = ({ reason = "", keys = [] } = {}) => {
  const normalizedReason = String(reason || "").toLowerCase();
  if (!normalizedReason) return false;
  if (shouldRefreshListagemHydrate(normalizedReason)) return true;
  if (normalizedReason.includes("dropdown-fields")) return true;
  if (normalizedReason === "storage") {
    const keyList = Array.isArray(keys) ? keys : [keys];
    return keyList.some((key) =>
      String(key || "").toLowerCase().includes(EMP_SEARCH_DROPDOWN_VIS_KEY.toLowerCase())
    );
  }
  return false;
};

export function useEmpSearchDropdownFields() {
  const { data: camposPersonalizados = [] } = useEmpCamposPersonalizados();

  const catalog = useMemo(
    () => sortCardConfigFieldsAlphabetically(buildEmpCardFieldCatalog(camposPersonalizados)),
    [camposPersonalizados]
  );

  const [visFields, setVisFields] = useState(() => loadSearchDropdownVisFields(EMP_SEARCH_DEFAULT_FIELDS));

  useEffect(() => {
    const sourceCatalog = catalog.length > 0 ? catalog : EMP_SEARCH_DEFAULT_FIELDS;
    const reloadFromStorage = () => {
      setVisFields((current) => {
        const next = loadSearchDropdownVisFields(sourceCatalog);
        return stableJsonEqual(current, next) ? current : next;
      });
    };
    reloadFromStorage();
    const unsubscribe = subscribeEmpPreferencesCache((detail) => {
      if (!shouldRefreshDropdownByCacheEvent(detail)) return;
      reloadFromStorage();
    });
    const onBootstrapApplied = () => reloadFromStorage();
    window.addEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onBootstrapApplied);
    return () => {
      unsubscribe();
      window.removeEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onBootstrapApplied);
    };
  }, [catalog]);

  const configFields = useMemo(() => {
    const merged = mergeSearchVisFields(catalog, visFields.length > 0 ? visFields : catalog);
    return sortCardConfigFieldsAlphabetically(merged);
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
      setVisFields(normalized);
      saveSearchDropdownVisFields(normalized);
    },
    [catalog]
  );

  const getRestoreDefaults = useCallback(
    () => sortCardConfigFieldsAlphabetically(getDefaultCardVisFields(catalog)),
    [catalog]
  );

  return {
    configFields,
    detailFields,
    saveConfig,
    getRestoreDefaults,
  };
}

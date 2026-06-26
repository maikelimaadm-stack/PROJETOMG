import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMP_FILTER_FIELDS_LAYOUT_KEY,
  applyFilterFieldsLayout,
  getDefaultFilterFieldsLayout,
  loadFilterFieldsLayout,
  mergeSavedFilterFieldOrder,
  mergeSavedVisibleFilterFields,
  saveFilterFieldsLayout,
} from "@/modules/empresas/utils/empFilterFieldsLayout";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { stableJsonEqual } from "@/shared/utils/stableStringify";
import { EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";
import { shouldRefreshListagemHydrate } from "@/modules/empresas/preferences/empListagemSectionCacheEvents";

const shouldRefreshFilterLayoutByCacheEvent = ({ reason = "", keys = [] } = {}) => {
  const normalizedReason = String(reason || "").toLowerCase();
  if (!normalizedReason) return false;
  if (shouldRefreshListagemHydrate(normalizedReason)) return true;
  if (
    normalizedReason.includes("filter-layout") ||
    normalizedReason.includes("filter-operators") ||
    normalizedReason.includes("dropdown-fields") ||
    normalizedReason.includes("favorites")
  ) {
    return true;
  }
  if (normalizedReason === "storage") {
    const keyList = Array.isArray(keys) ? keys : [keys];
    return keyList.some((key) =>
      String(key || "")
        .toLowerCase()
        .includes(EMP_FILTER_FIELDS_LAYOUT_KEY.toLowerCase())
    );
  }
  return false;
};

/** Mesmo padrão de useEmpSearchDropdownFields — reload do storage quando catálogo ou hydrate muda. */
export function useEmpFilterFieldsLayout(catalogFields = []) {
  const catalogKeys = useMemo(
    () => catalogFields.map((field) => field.key).filter(Boolean),
    [catalogFields]
  );
  const catalogKey = useMemo(() => catalogKeys.join("|"), [catalogKeys]);

  const [layout, setLayout] = useState(() =>
    loadFilterFieldsLayout(catalogKeys.length > 0 ? catalogKeys : [])
  );

  useEffect(() => {
    const keys = catalogKey ? catalogKey.split("|") : [];

    const reloadFromStorage = () => {
      setLayout((current) => {
        const next = loadFilterFieldsLayout(keys);
        return stableJsonEqual(current, next) ? current : next;
      });
    };

    reloadFromStorage();

    const unsubscribe = subscribeEmpPreferencesCache((detail) => {
      if (!shouldRefreshFilterLayoutByCacheEvent(detail)) return;
      reloadFromStorage();
    });

    const onDomOrBootstrap = () => reloadFromStorage();
    window.addEventListener("emp-filter-fields-layout-updated", onDomOrBootstrap);
    window.addEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onDomOrBootstrap);

    return () => {
      unsubscribe();
      window.removeEventListener("emp-filter-fields-layout-updated", onDomOrBootstrap);
      window.removeEventListener(EMP_PREFERENCES_BOOTSTRAP_APPLIED_EVENT, onDomOrBootstrap);
    };
  }, [catalogKey]);

  const filterFields = useMemo(() => {
    return applyFilterFieldsLayout(catalogFields, layout);
  }, [catalogFields, layout]);

  const saveLayout = useCallback(
    ({ visiveis, ordem }) => {
      const nextLayout = {
        visiveis: mergeSavedVisibleFilterFields(visiveis, catalogKeys),
        ordem: mergeSavedFilterFieldOrder(ordem, catalogKeys),
      };
      setLayout(nextLayout);
      saveFilterFieldsLayout(nextLayout);
    },
    [catalogKeys]
  );

  const getRestoreDefaults = useCallback(
    () => getDefaultFilterFieldsLayout(catalogKeys),
    [catalogKeys]
  );

  return {
    filterFields,
    layout,
    saveLayout,
    getRestoreDefaults,
    catalogFields,
  };
}

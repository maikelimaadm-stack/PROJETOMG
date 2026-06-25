import { useCallback, useEffect, useMemo, useState } from "react";
import {
  EMP_FILTER_FIELDS_LAYOUT_KEY,
  applyFilterFieldsLayout,
  getDefaultFilterFieldsLayout,
  loadFilterFieldsLayout,
  mergeSavedFilterFieldOrder,
  mergeSavedVisibleFilterFields,
  mergeVisibleFilterFieldsWithCatalog,
  saveFilterFieldsLayout,
} from "@/modules/empresas/utils/empFilterFieldsLayout";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";
import { FILTER_MAX_VISIBLE_KEY } from "@/modules/empresas/components/tblEmp.constants";
import { stableJsonEqual } from "@/shared/utils/stableStringify";

const shouldRefreshFilterLayoutByCacheEvent = ({ reason = "", keys = [] } = {}) => {
  const normalizedReason = String(reason || "").toLowerCase();
  if (!normalizedReason) return false;
  if (normalizedReason.includes("filter-layout")) return true;
  if (normalizedReason.includes("filter-max")) return true;
  if (normalizedReason.includes("listagem:hydrate")) return true;
  if (normalizedReason === "storage") {
    const keyList = Array.isArray(keys) ? keys : [keys];
    return keyList.some((key) => {
      const normalizedKey = String(key || "").toLowerCase();
      return (
        normalizedKey.includes(EMP_FILTER_FIELDS_LAYOUT_KEY.toLowerCase()) ||
        normalizedKey.includes(FILTER_MAX_VISIBLE_KEY.toLowerCase())
      );
    });
  }
  return false;
};

export function useEmpFilterFieldsLayout(catalogFields = []) {
  const catalogKey = useMemo(
    () =>
      catalogFields
        .map((field) => field.key)
        .filter(Boolean)
        .join("|"),
    [catalogFields]
  );

  const catalogKeys = useMemo(
    () => (catalogKey ? catalogKey.split("|") : []),
    [catalogKey]
  );

  const [layout, setLayout] = useState(() =>
    loadFilterFieldsLayout(catalogKeys)
  );

  useEffect(() => {
    const refresh = (detail = null) => {
      const isDomEvent = detail && typeof detail === "object" && "type" in detail;
      if (detail && !isDomEvent && !shouldRefreshFilterLayoutByCacheEvent(detail)) return;
      const nextLayout = loadFilterFieldsLayout(catalogKeys);
      setLayout((current) => (stableJsonEqual(current, nextLayout) ? current : nextLayout));
    };
    refresh();
    const unsubscribeCache = subscribeEmpPreferencesCache(refresh);
    window.addEventListener("emp-filter-fields-layout-updated", refresh);
    return () => {
      unsubscribeCache();
      window.removeEventListener("emp-filter-fields-layout-updated", refresh);
    };
  }, [catalogKey, catalogKeys]);

  useEffect(() => {
    setLayout((current) => {
      const ordem = mergeSavedFilterFieldOrder(current.ordem, catalogKeys);
      const visiveis = mergeVisibleFilterFieldsWithCatalog(
        current.visiveis,
        catalogKeys,
        current.ordem
      );
      if (
        ordem.join("|") === current.ordem.join("|") &&
        visiveis.join("|") === current.visiveis.join("|")
      ) {
        return current;
      }
      return { ordem, visiveis };
    });
  }, [catalogKey, catalogKeys]);

  const filterFields = useMemo(() => {
    return applyFilterFieldsLayout(catalogFields, layout);
  }, [catalogFields, layout]);

  const saveLayout = useCallback(
    ({ visiveis, ordem, maxVisible }) => {
      const nextLayout = {
        visiveis: mergeSavedVisibleFilterFields(visiveis, catalogKeys),
        ordem: mergeSavedFilterFieldOrder(ordem, catalogKeys),
        maxVisible: maxVisible ?? layout.maxVisible,
      };
      setLayout(nextLayout);
      saveFilterFieldsLayout(nextLayout);
    },
    [catalogKeys, layout.maxVisible]
  );

  const getRestoreDefaults = useCallback(
    () => getDefaultFilterFieldsLayout(catalogKeys),
    [catalogKeys]
  );

  return {
    filterFields,
    layout,
    maxVisibleFields: layout.maxVisible,
    saveLayout,
    getRestoreDefaults,
    catalogFields,
  };
}

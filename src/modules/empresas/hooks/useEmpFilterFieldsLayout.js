import { useCallback, useEffect, useMemo, useState } from "react";
import {
  applyFilterFieldsLayout,
  getDefaultFilterFieldsLayout,
  loadFilterFieldsLayout,
  mergeSavedFilterFieldOrder,
  mergeSavedVisibleFilterFields,
  mergeVisibleFilterFieldsWithCatalog,
  saveFilterFieldsLayout,
} from "@/modules/empresas/utils/empFilterFieldsLayout";
import { subscribeEmpPreferencesCache } from "@/modules/empresas/preferences/empresasPreferencesCache";

export function useEmpFilterFieldsLayout(catalogFields = []) {
  const [layoutVersion, setLayoutVersion] = useState(0);

  const catalogKeys = useMemo(
    () => catalogFields.map((field) => field.key),
    [catalogFields]
  );

  const catalogKey = useMemo(() => catalogKeys.join("|"), [catalogKeys]);

  const [layout, setLayout] = useState(() =>
    loadFilterFieldsLayout(catalogKeys)
  );

  useEffect(() => {
    const refresh = () => {
      setLayout(loadFilterFieldsLayout(catalogKeys));
      setLayoutVersion((current) => current + 1);
    };
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
    void layoutVersion;
    return applyFilterFieldsLayout(catalogFields, layout);
  }, [catalogFields, layout, layoutVersion]);

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

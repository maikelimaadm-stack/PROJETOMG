import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/modules/empresas/repositories/empRepository";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  buildCardCatalogFromColumnsInUse,
  buildCardDetailFieldsFromColumns,
  getDefaultCardVisFields,
  mergeSearchVisFields,
  loadSearchVisFields,
  saveSearchVisFields,
  sortCardConfigFieldsAlphabetically,
} from "@/modules/empresas/components/empSearchView.constants";
import { getColumnsInUse } from "@/modules/empresas/utils/empTableColumnCatalog";

export function useEmpCardsVisFields({ columnsInUseOverride = null } = {}) {
  const [columnLayoutVersion, setColumnLayoutVersion] = useState(0);

  const { data: camposPersonalizados = [] } = useQuery({
    queryKey: ["emp-campos-personalizados"],
    queryFn: () => empRepository.listCamposPersonalizados(),
    initialData: [],
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  useEffect(() => {
    const refresh = () => setColumnLayoutVersion((current) => current + 1);
    window.addEventListener("storage", refresh);
    window.addEventListener("emp-column-layout-updated", refresh);
    return () => {
      window.removeEventListener("storage", refresh);
      window.removeEventListener("emp-column-layout-updated", refresh);
    };
  }, []);

  const columnsInUse = useMemo(() => {
    void columnLayoutVersion;
    if (Array.isArray(columnsInUseOverride) && columnsInUseOverride.length > 0) {
      return columnsInUseOverride;
    }
    return getColumnsInUse(camposPersonalizados).inUse;
  }, [camposPersonalizados, columnLayoutVersion, columnsInUseOverride]);

  const catalog = useMemo(
    () => buildCardCatalogFromColumnsInUse(columnsInUse),
    [columnsInUse]
  );

  const [visFields, setVisFields] = useState(() => loadSearchVisFields(EMP_SEARCH_DEFAULT_FIELDS));

  useEffect(() => {
    if (catalog.length === 0) return;
    setVisFields((current) => mergeSearchVisFields(catalog, current));
  }, [catalog]);

  const configFields = useMemo(() => {
    const merged = mergeSearchVisFields(
      catalog,
      visFields.length > 0 ? visFields : catalog
    );
    return sortCardConfigFieldsAlphabetically(merged);
  }, [catalog, visFields]);

  const detailFields = useMemo(
    () => buildCardDetailFieldsFromColumns(columnsInUse, visFields),
    [columnsInUse, visFields]
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
      saveSearchVisFields(normalized);
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
    visFields,
    saveConfig,
    getRestoreDefaults,
  };
}

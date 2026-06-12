import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import empRepository from "@/modules/empresas/repositories/empRepository";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  buildEmpCardFieldCatalog,
  buildSearchDropdownDetailFields,
  getDefaultCardVisFields,
  loadSearchDropdownVisFields,
  mergeSearchVisFields,
  saveSearchDropdownVisFields,
  sortCardConfigFieldsAlphabetically,
} from "@/modules/empresas/components/empSearchView.constants";

export function useEmpSearchDropdownFields() {
  const { data: camposPersonalizados = [] } = useQuery({
    queryKey: ["emp-campos-personalizados"],
    queryFn: () => empRepository.listCamposPersonalizados(),
    initialData: [],
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  const catalog = useMemo(
    () => sortCardConfigFieldsAlphabetically(buildEmpCardFieldCatalog(camposPersonalizados)),
    [camposPersonalizados]
  );

  const [visFields, setVisFields] = useState(() => loadSearchDropdownVisFields(EMP_SEARCH_DEFAULT_FIELDS));

  useEffect(() => {
    if (catalog.length === 0) return;
    setVisFields((current) => mergeSearchVisFields(catalog, current));
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

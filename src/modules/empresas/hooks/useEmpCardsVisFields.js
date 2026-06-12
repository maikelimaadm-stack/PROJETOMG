import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { empRepository } from "@/modules/empresas/repositories/empRepository";
import {
  EMP_SEARCH_DEFAULT_FIELDS,
  buildEmpCardFieldCatalog,
  mergeSearchVisFields,
  loadSearchVisFields,
  saveSearchVisFields,
} from "@/modules/empresas/components/empSearchView.constants";

export function useEmpCardsVisFields() {
  const { data: camposPersonalizados = [] } = useQuery({
    queryKey: ["emp-campos-personalizados"],
    queryFn: () => empRepository.listCamposPersonalizados(),
    initialData: [],
    staleTime: 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
  });

  const catalog = useMemo(() => {
    const built = buildEmpCardFieldCatalog(camposPersonalizados);
    return built.length > 0 ? built : EMP_SEARCH_DEFAULT_FIELDS;
  }, [camposPersonalizados]);

  const [visFields, setVisFields] = useState(() => loadSearchVisFields(EMP_SEARCH_DEFAULT_FIELDS));

  useEffect(() => {
    setVisFields(loadSearchVisFields(catalog));
  }, [catalog]);

  const configFields = useMemo(() => {
    const merged = mergeSearchVisFields(catalog, visFields.length > 0 ? visFields : catalog);
    return merged.length > 0 ? merged : EMP_SEARCH_DEFAULT_FIELDS;
  }, [catalog, visFields]);

  const detailFields = useMemo(
    () => visFields.filter((field) => field.visible && !field.primary),
    [visFields]
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

  return {
    configFields,
    detailFields,
    visFields,
    saveConfig,
  };
}

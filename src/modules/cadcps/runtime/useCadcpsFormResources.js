import { useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/shared/contexts/AuthContext";
import repCps from "@/modules/cadcps/repositories/repCps";
import { CADCPS_LIST_QUERY_KEY } from "@/modules/cadcps/data/cadcpsListCache.js";

export function useCadcpsFormResources({ formData }) {
  const { empresas: empresasSelector = [] } = useAuth();

  const { data: telas = [], isLoading: telasLoading, refetch: refetchTelas } = useQuery({
    queryKey: ["cadcps-telas"],
    queryFn: () => repCps.listTelas(),
    staleTime: 30_000,
  });

  const { data: camposList = [] } = useQuery({
    queryKey: CADCPS_LIST_QUERY_KEY,
    queryFn: () => repCps.listPage({ page: 1, pageSize: 500, sortBy: "codigo", sortDir: "asc" }),
    select: (payload) => payload?.items ?? [],
    staleTime: 30_000,
  });

  const formulaFields = useMemo(
    () =>
      camposList
        .filter((campo) => campo.tipo !== "formula" && campo.field_name !== formData?.field_name)
        .map((campo) => ({
          id: campo.field_name,
          field_name: campo.field_name,
          label: campo.nome,
        })),
    [camposList, formData?.field_name]
  );

  return {
    telas,
    telasLoading,
    refetchTelas,
    empresas: empresasSelector,
    formulaFields,
  };
}

export default useCadcpsFormResources;

import { useQuery } from "@tanstack/react-query";
import empRepository from "@/modules/empresas/repositories/empRepository";

const QUERY_KEY = ["emp-campos-personalizados"];

/**
 * Fonte única de verdade para campos personalizados aplicáveis a empresas.
 */
export function useEmpCamposPersonalizados(options = {}) {
  const { enabled = true } = options;

  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: () => empRepository.listCamposPersonalizados("aplicavel"),
    initialData: [],
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    enabled,
  });
}

export { QUERY_KEY as EMP_CAMPOS_PERSONALIZADOS_QUERY_KEY };

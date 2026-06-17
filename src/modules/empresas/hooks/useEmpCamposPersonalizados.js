import { useQuery } from "@tanstack/react-query";
import { AuthApi } from "@/apis/auth/AuthApi";
import empRepository from "@/modules/empresas/repositories/empRepository";
import { useAuth } from "@/shared/contexts/AuthContext";

export const buildEmpCamposPersonalizadosQueryKey = (empresaId) => [
  "emp-campos-personalizados",
  empresaId || "global",
];

/**
 * Fonte única de verdade para campos personalizados aplicáveis a empresas.
 */
export function useEmpCamposPersonalizados(options = {}) {
  const { selectedEmpresaId } = useAuth();
  const { enabled = true, empresaId = selectedEmpresaId ?? AuthApi.getSelectedEmpresaId() } = options;
  const queryKey = buildEmpCamposPersonalizadosQueryKey(empresaId);

  return useQuery({
    queryKey,
    queryFn: () => empRepository.listCamposPersonalizados("aplicavel"),
    initialData: [],
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    enabled,
  });
}

export const EMP_CAMPOS_PERSONALIZADOS_QUERY_KEY = ["emp-campos-personalizados"];

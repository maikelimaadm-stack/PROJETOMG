import { useQuery } from "@tanstack/react-query";
import { useModeloBase1Config } from "@/ModeloBase1/config";
import { useAuth } from "@/shared/contexts/AuthContext";

/**
 * Campos personalizados aplicáveis ao módulo — config-driven.
 */
export function useModeloBase1CustomFields(options = {}) {
  const config = useModeloBase1Config();
  const customFields = config.customFields ?? {};
  const { enabled = true, scopeId: scopeIdOverride } = options;
  const authScope = useAuth();
  const scopeId =
    scopeIdOverride ??
    (typeof customFields.resolveScopeId === "function"
      ? customFields.resolveScopeId(authScope)
      : customFields.scopeId);

  const queryKeyPrefix = customFields.queryKeyPrefix ?? `${config.moduleId}-campos-personalizados`;
  const queryKey = [queryKeyPrefix, scopeId || "global"];
  const listFn = customFields.listFn;

  return useQuery({
    queryKey,
    queryFn: () => (listFn ? listFn("aplicavel") : Promise.resolve([])),
    initialData: [],
    staleTime: 5 * 60_000,
    gcTime: 10 * 60_000,
    refetchOnMount: false,
    enabled: enabled && typeof listFn === "function",
  });
}

export default useModeloBase1CustomFields;

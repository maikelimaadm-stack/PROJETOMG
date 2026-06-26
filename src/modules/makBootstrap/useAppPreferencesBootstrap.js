/**
 * Agregador de bootstrap de preferências — camada de aplicação (não Foundation).
 * Módulos registram hooks via registerMakPreferencesBootstrapModule.
 */
import { useEmpresasPreferencesBootstrap } from "@/modules/empresas/preferences/useEmpresasPreferencesBootstrap";

export function useAppPreferencesBootstrap(enabledModuleIds, userId) {
  const ids = Array.isArray(enabledModuleIds) ? enabledModuleIds : ["empresas"];
  const activeUserId = userId ?? null;

  const empresasEnabled = ids.includes("empresas");
  const empresas = useEmpresasPreferencesBootstrap(empresasEnabled ? activeUserId : null);

  const modules = {
    ...(empresasEnabled ? { empresas } : {}),
  };

  return {
    moduleIds: ids,
    modules,
    empresas: empresasEnabled ? empresas : null,
    primary: empresasEnabled ? empresas : null,
  };
}

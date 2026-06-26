import { useEmpresasPreferencesBootstrap } from "@/modules/empresas/preferences/useEmpresasPreferencesBootstrap";

/**
 * Agrega bootstrap de preferências por moduleId.
 * Hooks devem ser invocados aqui (top-level) — não em loop dinâmico.
 */
export function useMakPreferencesBootstrapAggregator(enabledModuleIds, userId) {
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

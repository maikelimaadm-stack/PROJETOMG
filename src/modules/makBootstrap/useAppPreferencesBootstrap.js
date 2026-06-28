/**
 * Agregador multi-módulo de bootstrap de preferências.
 */
import { useEmpresasPreferencesBootstrap } from "@/modules/empresas/preferences/useEmpresasPreferencesBootstrap";
import { useCadcpsPreferencesBootstrap } from "@/modules/cadcps/preferences/registerCadcpsPreferencesBootstrap.js";
import { listMakPreferencesBootstrapModuleIds } from "@/framework/mak/preferences/bootstrapRegistry.js";

export function useAppPreferencesBootstrap(enabledModuleIds, userId) {
  const registryIds = listMakPreferencesBootstrapModuleIds();
  const ids = Array.isArray(enabledModuleIds) ? enabledModuleIds : registryIds;
  const activeUserId = userId ?? null;

  const empresasEnabled = ids.includes("empresas") && registryIds.includes("empresas");
  const cadcpsEnabled = ids.includes("cadcps") && registryIds.includes("cadcps");

  const empresas = useEmpresasPreferencesBootstrap(empresasEnabled ? activeUserId : null);
  const cadcps = useCadcpsPreferencesBootstrap(cadcpsEnabled ? activeUserId : null);

  const modules = {
    ...(empresasEnabled ? { empresas } : {}),
    ...(cadcpsEnabled ? { cadcps } : {}),
  };

  const primaryModuleId =
    empresasEnabled ? "empresas" : ids.find((id) => modules[id]) ?? null;

  return {
    moduleIds: ids,
    modules,
    empresas: empresasEnabled ? empresas : null,
    cadcps: cadcpsEnabled ? cadcps : null,
    primary: primaryModuleId ? modules[primaryModuleId] ?? null : null,
  };
}

export default useAppPreferencesBootstrap;

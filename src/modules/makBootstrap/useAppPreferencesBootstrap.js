/**
 * Agregador multi-módulo de bootstrap de preferências.
 */
import { useEmpresasPreferencesBootstrap } from "@/modules/empresas/preferences/useEmpresasPreferencesBootstrap";
import { useProdutosPreferencesBootstrap } from "@/modules/produtos/preferences/registerProdutosPreferencesBootstrap.js";
import { useMarcasPreferencesBootstrap } from "@/modules/marcas/preferences/registerMarcasPreferencesBootstrap.js";
import { useCadcpsPreferencesBootstrap } from "@/modules/cadcps/preferences/registerCadcpsPreferencesBootstrap.js";
import { listMakPreferencesBootstrapModuleIds } from "@/framework/mak/preferences/bootstrapRegistry.js";

export function useAppPreferencesBootstrap(enabledModuleIds, userId) {
  const registryIds = listMakPreferencesBootstrapModuleIds();
  const ids = Array.isArray(enabledModuleIds) ? enabledModuleIds : registryIds;
  const activeUserId = userId ?? null;

  const empresasEnabled = ids.includes("empresas") && registryIds.includes("empresas");
  const produtosEnabled = ids.includes("produtos") && registryIds.includes("produtos");
  const marcasEnabled = ids.includes("marcas") && registryIds.includes("marcas");
  const cadcpsEnabled = ids.includes("cadcps") && registryIds.includes("cadcps");

  const empresas = useEmpresasPreferencesBootstrap(empresasEnabled ? activeUserId : null);
  const produtos = useProdutosPreferencesBootstrap(produtosEnabled ? activeUserId : null);
  const marcas = useMarcasPreferencesBootstrap(marcasEnabled ? activeUserId : null);
  const cadcps = useCadcpsPreferencesBootstrap(cadcpsEnabled ? activeUserId : null);

  const modules = {
    ...(empresasEnabled ? { empresas } : {}),
    ...(produtosEnabled ? { produtos } : {}),
    ...(marcasEnabled ? { marcas } : {}),
    ...(cadcpsEnabled ? { cadcps } : {}),
  };

  const primaryModuleId =
    empresasEnabled ? "empresas" : ids.find((id) => modules[id]) ?? null;

  return {
    moduleIds: ids,
    modules,
    empresas: empresasEnabled ? empresas : null,
    produtos: produtosEnabled ? produtos : null,
    marcas: marcasEnabled ? marcas : null,
    cadcps: cadcpsEnabled ? cadcps : null,
    primary: primaryModuleId ? modules[primaryModuleId] ?? null : null,
  };
}

export default useAppPreferencesBootstrap;

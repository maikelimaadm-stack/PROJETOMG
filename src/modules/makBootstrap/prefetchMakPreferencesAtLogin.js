import { queryClientInstance } from "@/shared/contexts/queryClient";
import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import { prefetchEmpresasPreferencesAtLogin } from "@/modules/empresas/preferences/prefetchEmpresasPreferencesAtLogin";
import { buildMakPreferencesBootstrapQueryKey } from "@/framework/mak/preferences/makModulePreferencesQueryKeys.js";
import { listMakPreferencesBootstrapModuleIds } from "@/framework/mak/preferences/bootstrapRegistry.js";
import { createMakStandardModulePreferencesBootstrap } from "@/framework/mak/preferences/createMakStandardModulePreferencesBootstrap.js";
import { produtosModuleMetadata } from "@/modules/produtos/config/produtosModuleMetadata.js";
import { marcasModuleMetadata } from "@/modules/marcas/config/marcasModuleMetadata.js";
import { cadcpsModuleMetadata } from "@/modules/cadcps/config/cadcpsModuleMetadata.js";
import { dispatchMakPreferencesBootstrapApplied } from "@/framework/mak/preferences/makModulePreferencesBootstrapEvents.js";

const STANDARD_MODULE_CONFIG = {
  produtos: {
    keyPrefix: "pro",
    tableMetadata: produtosModuleMetadata.table,
    searchMetadata: produtosModuleMetadata.search,
    loadBatchStorageKey: "pro_infinite_batch_size",
  },
  marcas: {
    keyPrefix: "mar",
    tableMetadata: marcasModuleMetadata.table,
    searchMetadata: marcasModuleMetadata.search,
    loadBatchStorageKey: "mar_infinite_batch_size",
  },
  cadcps: {
    keyPrefix: "cps",
    tableMetadata: cadcpsModuleMetadata.table,
    searchMetadata: cadcpsModuleMetadata.search,
    loadBatchStorageKey: "cps_infinite_batch_size",
  },
};

async function prefetchStandardModulePreferencesAtLogin(moduleId, clienteId, userId) {
  const config = STANDARD_MODULE_CONFIG[moduleId];
  if (!config) return { hydrated: false };

  const { storage } = createMakStandardModulePreferencesBootstrap({
    moduleId,
    ...config,
  });

  const queryKey = buildMakPreferencesBootstrapQueryKey(moduleId, clienteId, userId);
  const listagemScopeKey = `${storage.listagemScope.modulo}.${storage.listagemScope.tela}`;

  try {
    const payload = await queryClientInstance.fetchQuery({
      queryKey,
      queryFn: () => userPreferencesApi.bootstrap(),
      staleTime: 10 * 60_000,
    });

    const mapped = storage.mapBootstrapPreferences(payload);
    const hasLocal = storage.hasScopedListagemPreferences();
    let visualChange = false;

    const listagemRecord = mapped[listagemScopeKey];
    if (listagemRecord?.preferencias) {
      visualChange = hasLocal
        ? storage.applyRemoteListagemPreferencesToStorage(listagemRecord.preferencias)
        : storage.applyListagemPreferencesToStorage(listagemRecord.preferencias, {
            reason: "listagem:hydrate",
          });
    }

    dispatchMakPreferencesBootstrapApplied(moduleId, {
      generation: 1,
      status: hasLocal ? "local_applied" : "remote_applied",
      hadLocalSnapshot: hasLocal,
      clienteId,
      userId,
    });

    return { hydrated: true, hasLocal, visualChange };
  } catch {
    return { hydrated: false };
  }
}

/** Prefetch + hidrata preferências no login para todos os módulos certificados. */
export async function prefetchMakPreferencesAtLogin(clienteId, userId) {
  if (!clienteId || !userId) return { hydrated: false, modules: {} };

  const moduleIds = listMakPreferencesBootstrapModuleIds();
  const results = {};

  if (moduleIds.includes("empresas")) {
    results.empresas = await prefetchEmpresasPreferencesAtLogin(clienteId, userId);
  }

  await Promise.all(
    moduleIds
      .filter((moduleId) => moduleId !== "empresas")
      .map(async (moduleId) => {
        results[moduleId] = await prefetchStandardModulePreferencesAtLogin(moduleId, clienteId, userId);
      })
  );

  return {
    hydrated: Object.values(results).some((result) => result?.hydrated),
    modules: results,
  };
}

export default prefetchMakPreferencesAtLogin;

import { getLayoutStorageKeysForModule } from "@/framework/cadastro-engine/core/CadastroModuleConfig.js";

/**
 * Metadata declarativa da Layout Configuration Engine — promovida do Cadastro de Empresas.
 * @param {import("@/framework/cadastro-engine/core/CadastroModuleConfig.js").CadastroModuleConfig} cadastroConfig
 * @param {object} [overrides]
 */
export function buildMakLayoutConfigMetadata(cadastroConfig, overrides = {}) {
  if (!cadastroConfig?.moduleId) {
    throw new Error("buildMakLayoutConfigMetadata: cadastroConfig.moduleId é obrigatório.");
  }

  const storageKeys = getLayoutStorageKeysForModule(cadastroConfig);

  return Object.freeze({
    moduleId: cadastroConfig.moduleId,
    entityName: cadastroConfig.entityName,
    screenKey: cadastroConfig.screenKey,
    storagePrefix: cadastroConfig.storagePrefix,
    mainTabId: cadastroConfig.mainTabId ?? "principais",
    systemPanelIds: cadastroConfig.systemPanelIds ?? [],
    fixedPanelIds: overrides.fixedPanelIds ?? cadastroConfig.fixedPanelIds ?? [],
    fixedVisibleFieldIds:
      overrides.fixedVisibleFieldIds ?? cadastroConfig.fixedVisibleFieldIds ?? [],
    brandTheme: overrides.brandTheme ?? cadastroConfig.brandTheme ?? true,
    customFieldsQueryKey: cadastroConfig.customFieldsQueryKey,
    nativeRequiredFieldNames: cadastroConfig.nativeRequiredFieldNames ?? [],
    storageKeys,
    layoutUpdatedEvent: `cadastro-layout-updated:${cadastroConfig.moduleId}`,
    layoutHydratedEvent: `cadastro-layout-hydrated:${cadastroConfig.moduleId}`,
    configuratorComponent: "CadLayoutConfigurator",
    engineVersion: 3,
  });
}

export default buildMakLayoutConfigMetadata;

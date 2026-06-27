import { CadastroEngine } from "@/framework/cadastro-engine/core/CadastroEngine.js";
import { registerCadastroModule } from "@/framework/cadastro-engine/core/ModuleRegistry.js";
import { buildMakLayoutConfigMetadata } from "./buildMakLayoutConfigMetadata.js";

/**
 * Instancia a Layout Configuration Engine existente (cadastro-engine) para um módulo.
 * Não reimplementa — promove CadLayoutConfigurator + LayoutEngine + LayoutPreferencesEngine.
 * @param {import("@/framework/cadastro-engine/core/CadastroModuleConfig.js").CadastroModuleConfig} cadastroConfig
 * @param {object} [metadataOverrides]
 */
export function createMakLayoutConfigEngine(cadastroConfig, metadataOverrides = {}) {
  registerCadastroModule(cadastroConfig);
  const engine = CadastroEngine.for(cadastroConfig.moduleId);
  const metadata = buildMakLayoutConfigMetadata(cadastroConfig, metadataOverrides);

  return Object.freeze({
    moduleId: cadastroConfig.moduleId,
    config: cadastroConfig,
    metadata,
    layout: engine.layout,
    preferences: engine.preferences,
    customFields: engine.customFields,
    fields: engine.fields,
    validation: engine.validation,
  });
}

export default createMakLayoutConfigEngine;

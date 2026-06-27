/**
 * Registro da Layout Configuration Engine para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { createMakLayoutConfigEngine } from "@/framework/mak/layoutConfig/createMakLayoutConfigEngine.js";
import { registerMakLayoutConfigEngine } from "@/framework/mak/layoutConfig/makLayoutConfigRegistry.js";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";
import { produtosCadastroConfig } from "@/modules/produtos/config/produtosCadastroConfig.js";
import { marcasCadastroConfig } from "@/modules/marcas/config/marcasCadastroConfig.js";
import { cadcpsCadastroConfig } from "@/modules/cadcps/config/cadcpsCadastroConfig.js";

const CADASTRO_CONFIG_BY_MODULE = {
  empresas: empresasCadastroConfig,
  produtos: produtosCadastroConfig,
  marcas: marcasCadastroConfig,
  cadcps: cadcpsCadastroConfig,
};

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    const cadastroConfig = CADASTRO_CONFIG_BY_MODULE[module.moduleId];
    if (!cadastroConfig) return;
    registerMakLayoutConfigEngine(
      module.moduleId,
      createMakLayoutConfigEngine(cadastroConfig)
    );
  });

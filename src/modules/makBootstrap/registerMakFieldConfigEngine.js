/**
 * Registro da Field Configuration Engine para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { createMakFieldConfigEngine } from "@/framework/mak/fieldConfig/createMakFieldConfigEngine.js";
import { registerMakFieldConfigEngine } from "@/framework/mak/fieldConfig/makFieldConfigRegistry.js";
import { MAK_FIELD_CERTIFICATION_CATALOG } from "@/framework/mak/fieldConfig/fieldCertificationCatalog.js";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";
import { cadcpsCadastroConfig } from "@/modules/cadcps/config/cadcpsCadastroConfig.js";
import { EMP_FORM_FIELD_DEFS } from "@/modules/empresas/components/formEmp.constants.js";

const CADASTRO_CONFIG_BY_MODULE = {
  empresas: empresasCadastroConfig,
  cadcps: cadcpsCadastroConfig,
};

const FIELD_DEFINITIONS_BY_MODULE = {
  empresas: EMP_FORM_FIELD_DEFS,
};

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    const cadastroConfig = CADASTRO_CONFIG_BY_MODULE[module.moduleId];
    if (!cadastroConfig) return;
    registerMakFieldConfigEngine(
      module.moduleId,
      createMakFieldConfigEngine(module.moduleId, {
        cadastroConfig,
        fieldDefinitions: FIELD_DEFINITIONS_BY_MODULE[module.moduleId] ?? [],
      })
    );
  });

/** Módulo fictício de certificação V14 — consome apenas metadata. */
registerMakFieldConfigEngine(
  "fieldcert",
  createMakFieldConfigEngine("fieldcert", {
    fieldDefinitions: MAK_FIELD_CERTIFICATION_CATALOG,
  })
);

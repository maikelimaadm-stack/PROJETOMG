/**
 * Registro da Validation Configuration Engine para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { createMakValidationConfigEngine } from "@/framework/mak/validation/createMakValidationConfigEngine.js";
import { registerMakValidationConfigEngine } from "@/framework/mak/validation/makValidationConfigRegistry.js";
import { MAK_VALIDATION_CERTIFICATION_CATALOG } from "@/framework/mak/validation/validationCertificationCatalog.js";
import { empresasCadastroConfig } from "@/modules/empresas/config/empresasCadastroConfig.js";
import { cadcpsCadastroConfig } from "@/modules/cadcps/config/cadcpsCadastroConfig.js";
import { EMP_FORM_FIELD_DEFS } from "@/modules/empresas/components/formEmp.constants.js";
import { empresasSchema } from "@/modules/empresas/config/empresasSchema.js";
import { cadcpsFormSchema } from "@/modules/cadcps/config/cadcpsSchema.js";

const CADASTRO_CONFIG_BY_MODULE = {
  empresas: empresasCadastroConfig,
  cadcps: cadcpsCadastroConfig,
};

const FIELD_DEFINITIONS_BY_MODULE = {
  empresas: EMP_FORM_FIELD_DEFS,
};

const SCHEMA_BY_MODULE = {
  empresas: empresasSchema,
  cadcps: cadcpsFormSchema,
};

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    const cadastroConfig = CADASTRO_CONFIG_BY_MODULE[module.moduleId];
    if (!cadastroConfig) return;
    registerMakValidationConfigEngine(
      module.moduleId,
      createMakValidationConfigEngine(module.moduleId, {
        cadastroConfig,
        fieldDefinitions: FIELD_DEFINITIONS_BY_MODULE[module.moduleId] ?? [],
        schema: SCHEMA_BY_MODULE[module.moduleId] ?? null,
      })
    );
  });

registerMakValidationConfigEngine(
  "validationcert",
  createMakValidationConfigEngine("validationcert", {
    fieldDefinitions: MAK_VALIDATION_CERTIFICATION_CATALOG,
  })
);

/**
 * Registro da Formula Configuration Engine para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { createMakFormulaConfigEngine } from "@/framework/mak/formula/createMakFormulaConfigEngine.js";
import { registerMakFormulaConfigEngine } from "@/framework/mak/formula/makFormulaConfigRegistry.js";
import { MAK_FORMULA_CERTIFICATION_CATALOG } from "@/framework/mak/formula/formulaCertificationCatalog.js";
import { EMP_FORM_FIELD_DEFS } from "@/modules/empresas/components/formEmp.constants.js";

const FIELD_DEFINITIONS_BY_MODULE = {
  empresas: EMP_FORM_FIELD_DEFS,
  cadcps: [],
};

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    registerMakFormulaConfigEngine(
      module.moduleId,
      createMakFormulaConfigEngine(module.moduleId, {
        fieldDefinitions: FIELD_DEFINITIONS_BY_MODULE[module.moduleId] ?? [],
      })
    );
  });

registerMakFormulaConfigEngine(
  "formulacert",
  createMakFormulaConfigEngine("formulacert", {
    fieldDefinitions: MAK_FORMULA_CERTIFICATION_CATALOG,
  })
);

/**
 * Legacy boot-cache registration for modules not yet on CRB hydration path.
 * Extracted from registerMak* side-effect modules — invoked by Runtime Bridge only.
 */
import registry from "../../../../config/cadastro-modules.registry.json";
import { createMakLayoutConfigEngine } from "@/framework/mak/layoutConfig/createMakLayoutConfigEngine.js";
import { registerMakLayoutConfigEngine } from "@/framework/mak/layoutConfig/makLayoutConfigRegistry.js";
import { createMakFieldConfigEngine } from "@/framework/mak/fieldConfig/createMakFieldConfigEngine.js";
import { registerMakFieldConfigEngine } from "@/framework/mak/fieldConfig/makFieldConfigRegistry.js";
import { MAK_FIELD_CERTIFICATION_CATALOG } from "@/framework/mak/fieldConfig/fieldCertificationCatalog.js";
import { createMakValidationConfigEngine } from "@/framework/mak/validation/createMakValidationConfigEngine.js";
import { registerMakValidationConfigEngine } from "@/framework/mak/validation/makValidationConfigRegistry.js";
import { MAK_VALIDATION_CERTIFICATION_CATALOG } from "@/framework/mak/validation/validationCertificationCatalog.js";
import { createMakFormulaConfigEngine } from "@/framework/mak/formula/createMakFormulaConfigEngine.js";
import { registerMakFormulaConfigEngine } from "@/framework/mak/formula/makFormulaConfigRegistry.js";
import { MAK_FORMULA_CERTIFICATION_CATALOG } from "@/framework/mak/formula/formulaCertificationCatalog.js";
import { createMakEventConfigEngine } from "@/framework/mak/events/createMakEventConfigEngine.js";
import { registerMakEventConfigEngine } from "@/framework/mak/events/makEventConfigRegistry.js";
import { MAK_EVENT_CERTIFICATION_DEFINITIONS } from "@/framework/mak/events/eventCertificationCatalog.js";
import { createMakActionConfigEngine } from "@/framework/mak/actions/createMakActionConfigEngine.js";
import { registerMakActionConfigEngine } from "@/framework/mak/actions/makActionConfigRegistry.js";
import { MAK_ACTION_CERTIFICATION_DEFINITIONS } from "@/framework/mak/actions/actionCertificationCatalog.js";
import { createMakWorkflowConfigEngine } from "@/framework/mak/workflow/createMakWorkflowConfigEngine.js";
import { registerMakWorkflowConfigEngine } from "@/framework/mak/workflow/makWorkflowConfigRegistry.js";
import { MAK_WORKFLOW_CERTIFICATION_DEFINITIONS } from "@/framework/mak/workflow/workflowCertificationCatalog.js";
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

const resolveTargetModules = (options = {}) => {
  const active = registry.filter((module) => module.ativo !== false);
  const skip = new Set(options.skipModules ?? []);
  const only = options.onlyModules ? new Set(options.onlyModules) : null;

  return active.filter((module) => {
    if (skip.has(module.moduleId)) return false;
    if (only && !only.has(module.moduleId)) return false;
    return Boolean(CADASTRO_CONFIG_BY_MODULE[module.moduleId]);
  });
};

const registerModuleEngines = (module) => {
  const cadastroConfig = CADASTRO_CONFIG_BY_MODULE[module.moduleId];
  const fieldDefinitions = FIELD_DEFINITIONS_BY_MODULE[module.moduleId] ?? [];
  const schema = SCHEMA_BY_MODULE[module.moduleId] ?? null;

  registerMakLayoutConfigEngine(
    module.moduleId,
    createMakLayoutConfigEngine(cadastroConfig)
  );

  registerMakFieldConfigEngine(
    module.moduleId,
    createMakFieldConfigEngine(module.moduleId, {
      cadastroConfig,
      fieldDefinitions,
    })
  );

  registerMakValidationConfigEngine(
    module.moduleId,
    createMakValidationConfigEngine(module.moduleId, {
      cadastroConfig,
      fieldDefinitions,
      schema,
    })
  );

  registerMakFormulaConfigEngine(
    module.moduleId,
    createMakFormulaConfigEngine(module.moduleId, { fieldDefinitions })
  );

  registerMakEventConfigEngine(
    module.moduleId,
    createMakEventConfigEngine(module.moduleId, {
      eventDefinitions: module.eventDefinitions ?? [],
    })
  );

  registerMakActionConfigEngine(
    module.moduleId,
    createMakActionConfigEngine(module.moduleId, {
      actionDefinitions: module.actionDefinitions ?? [],
    })
  );

  registerMakWorkflowConfigEngine(
    module.moduleId,
    createMakWorkflowConfigEngine(module.moduleId, {
      workflowDefinitions: module.workflowDefinitions ?? [],
    })
  );
};

let certificationModulesRegistered = false;

const registerCertificationModules = () => {
  if (certificationModulesRegistered) return;
  certificationModulesRegistered = true;

  registerMakFieldConfigEngine(
    "fieldcert",
    createMakFieldConfigEngine("fieldcert", {
      fieldDefinitions: MAK_FIELD_CERTIFICATION_CATALOG,
    })
  );

  registerMakValidationConfigEngine(
    "validationcert",
    createMakValidationConfigEngine("validationcert", {
      fieldDefinitions: MAK_VALIDATION_CERTIFICATION_CATALOG,
    })
  );

  registerMakFormulaConfigEngine(
    "formulacert",
    createMakFormulaConfigEngine("formulacert", {
      fieldDefinitions: MAK_FORMULA_CERTIFICATION_CATALOG,
    })
  );

  registerMakEventConfigEngine(
    "eventscert",
    createMakEventConfigEngine("eventscert", {
      eventDefinitions: MAK_EVENT_CERTIFICATION_DEFINITIONS,
    })
  );

  registerMakActionConfigEngine(
    "actionscert",
    createMakActionConfigEngine("actionscert", {
      actionDefinitions: MAK_ACTION_CERTIFICATION_DEFINITIONS,
    })
  );

  registerMakWorkflowConfigEngine(
    "workflowcert",
    createMakWorkflowConfigEngine("workflowcert", {
      workflowDefinitions: MAK_WORKFLOW_CERTIFICATION_DEFINITIONS,
    })
  );
};

/**
 * @param {object} [options]
 * @param {string[]} [options.skipModules]
 * @param {string[]} [options.onlyModules]
 */
export function registerLegacyBootCacheEngines(options = {}) {
  resolveTargetModules(options).forEach(registerModuleEngines);
  registerCertificationModules();
}

export default registerLegacyBootCacheEngines;

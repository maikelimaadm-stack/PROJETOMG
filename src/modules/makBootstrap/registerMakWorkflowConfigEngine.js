/**
 * Registro da Workflow Configuration Engine para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { createMakWorkflowConfigEngine } from "@/framework/mak/workflow/createMakWorkflowConfigEngine.js";
import { registerMakWorkflowConfigEngine } from "@/framework/mak/workflow/makWorkflowConfigRegistry.js";
import { MAK_WORKFLOW_CERTIFICATION_DEFINITIONS } from "@/framework/mak/workflow/workflowCertificationCatalog.js";

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    registerMakWorkflowConfigEngine(
      module.moduleId,
      createMakWorkflowConfigEngine(module.moduleId, {
        workflowDefinitions: module.workflowDefinitions ?? [],
      })
    );
  });

registerMakWorkflowConfigEngine(
  "workflowcert",
  createMakWorkflowConfigEngine("workflowcert", {
    workflowDefinitions: MAK_WORKFLOW_CERTIFICATION_DEFINITIONS,
  })
);

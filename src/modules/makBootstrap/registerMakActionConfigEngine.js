/**
 * Registro da Actions Configuration Engine para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { createMakActionConfigEngine } from "@/framework/mak/actions/createMakActionConfigEngine.js";
import { registerMakActionConfigEngine } from "@/framework/mak/actions/makActionConfigRegistry.js";
import { MAK_ACTION_CERTIFICATION_DEFINITIONS } from "@/framework/mak/actions/actionCertificationCatalog.js";

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    registerMakActionConfigEngine(
      module.moduleId,
      createMakActionConfigEngine(module.moduleId, {
        actionDefinitions: module.actionDefinitions ?? [],
      })
    );
  });

registerMakActionConfigEngine(
  "actionscert",
  createMakActionConfigEngine("actionscert", {
    actionDefinitions: MAK_ACTION_CERTIFICATION_DEFINITIONS,
  })
);

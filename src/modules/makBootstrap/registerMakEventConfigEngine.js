/**
 * Registro da Events Configuration Engine para módulos certificados.
 */
import registry from "../../../config/cadastro-modules.registry.json";
import { createMakEventConfigEngine } from "@/framework/mak/events/createMakEventConfigEngine.js";
import { registerMakEventConfigEngine } from "@/framework/mak/events/makEventConfigRegistry.js";
import {
  MAK_EVENT_CERTIFICATION_DEFINITIONS,
} from "@/framework/mak/events/eventCertificationCatalog.js";

registry
  .filter((module) => module.ativo !== false)
  .forEach((module) => {
    registerMakEventConfigEngine(
      module.moduleId,
      createMakEventConfigEngine(module.moduleId, {
        eventDefinitions: module.eventDefinitions ?? [],
      })
    );
  });

registerMakEventConfigEngine(
  "eventscert",
  createMakEventConfigEngine("eventscert", {
    eventDefinitions: MAK_EVENT_CERTIFICATION_DEFINITIONS,
  })
);

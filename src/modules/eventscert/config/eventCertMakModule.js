/**
 * Módulo fictício de certificação — Events Configuration Engine V18.
 */
import { defineMakModule } from "@/framework/mak/runtime";
import { eventCertModuleMetadata } from "@/modules/eventscert/config/eventCertModuleMetadata.js";

export const eventCertMakModule = defineMakModule(
  {
    moduleId: "eventscert",
    singularLabel: "Evento Cert",
    pluralLabel: "Eventos Cert",
    entityName: "EventCertDemo",
  },
  eventCertModuleMetadata,
  { metricsEntityKey: "eventscert" }
);

export default eventCertMakModule;

/**
 * Módulo fictício de certificação — Formula Configuration Engine V17.
 */
import { defineMakModule } from "@/framework/mak/runtime";
import { formulaCertModuleMetadata } from "@/modules/formulacert/config/formulaCertModuleMetadata.js";

export const formulaCertMakModule = defineMakModule(
  {
    moduleId: "formulacert",
    singularLabel: "Fórmula Cert",
    pluralLabel: "Fórmulas Cert",
    entityName: "FormulaCertDemo",
  },
  formulaCertModuleMetadata,
  { metricsEntityKey: "formulacert" }
);

export default formulaCertMakModule;

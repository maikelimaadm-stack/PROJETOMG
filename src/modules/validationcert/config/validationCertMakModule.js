/**
 * Módulo fictício de certificação — Validation Configuration Engine V16.
 */
import { defineMakModule } from "@/framework/mak/runtime";
import { validationCertModuleMetadata } from "@/modules/validationcert/config/validationCertModuleMetadata.js";

export const validationCertMakModule = defineMakModule(
  {
    moduleId: "validationcert",
    singularLabel: "Validação Cert",
    pluralLabel: "Validações Cert",
    entityName: "ValidationCertDemo",
  },
  validationCertModuleMetadata,
  { metricsEntityKey: "validationcert" }
);

export default validationCertMakModule;

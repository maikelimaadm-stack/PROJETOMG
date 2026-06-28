/**
 * Módulo fictício de certificação — Actions Configuration Engine V19.
 */
import { defineMakModule } from "@/framework/mak/runtime";
import { actionCertModuleMetadata } from "@/modules/actionscert/config/actionCertModuleMetadata.js";

export const actionCertMakModule = defineMakModule(
  {
    moduleId: "actionscert",
    singularLabel: "Ação Cert",
    pluralLabel: "Ações Cert",
    entityName: "ActionCertDemo",
  },
  actionCertModuleMetadata,
  { metricsEntityKey: "actionscert" }
);

export default actionCertMakModule;

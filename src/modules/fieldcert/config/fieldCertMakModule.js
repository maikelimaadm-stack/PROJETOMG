/**
 * Módulo fictício de certificação — Field Configuration Engine V14.
 * Demonstra uso exclusivo via metadata (sem componentes React específicos).
 */
import { defineMakModule } from "@/framework/mak/runtime";
import { fieldCertModuleMetadata } from "@/modules/fieldcert/config/fieldCertModuleMetadata.js";

export const fieldCertMakModule = defineMakModule(
  {
    moduleId: "fieldcert",
    singularLabel: "Campo Cert",
    pluralLabel: "Campos Cert",
    entityName: "FieldCertDemo",
  },
  fieldCertModuleMetadata,
  { metricsEntityKey: "fieldcert" }
);

export default fieldCertMakModule;

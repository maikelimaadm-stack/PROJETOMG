/**
 * Módulo fictício de certificação — Workflow Configuration Engine V20.
 */
import { defineMakModule } from "@/framework/mak/runtime";
import { workflowCertModuleMetadata } from "@/modules/workflowcert/config/workflowCertModuleMetadata.js";

export const workflowCertMakModule = defineMakModule(
  {
    moduleId: "workflowcert",
    singularLabel: "Workflow Cert",
    pluralLabel: "Workflows Cert",
    entityName: "WorkflowCertDemo",
  },
  workflowCertModuleMetadata,
  { metricsEntityKey: "workflowcert" }
);

export default workflowCertMakModule;

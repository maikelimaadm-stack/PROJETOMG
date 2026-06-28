/**
 * Módulo fictício de certificação — Workflow Configuration Engine V20.
 */
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";
import {
  MAK_WORKFLOW_CERTIFICATION_CATALOG,
  MAK_WORKFLOW_CERTIFICATION_LAYOUT,
  MAK_WORKFLOW_CERTIFICATION_DEFINITIONS,
  MAK_WORKFLOW_CERTIFICATION_EVENT_DEFINITIONS,
} from "@/framework/mak/workflow/workflowCertificationCatalog.js";

export const workflowCertModuleMetadata = {
  form: buildMakFormMetadata({
    basePanels: [{ id: "principais", label: "Workflows" }],
    defaultLayout: MAK_WORKFLOW_CERTIFICATION_LAYOUT,
    buildEmptyRecord: () =>
      Object.fromEntries(
        MAK_WORKFLOW_CERTIFICATION_CATALOG.map((field) => [
          field.name,
          field.type === "number" ? 0 : "",
        ])
      ),
    buildDefaultConfig: () => ({
      version: 3,
      panels: [{ id: "principais", label: "Workflows" }],
      layout: MAK_WORKFLOW_CERTIFICATION_LAYOUT,
    }),
    fieldDefinitions: MAK_WORKFLOW_CERTIFICATION_CATALOG,
    workflowDefinitions: MAK_WORKFLOW_CERTIFICATION_DEFINITIONS,
    eventDefinitions: MAK_WORKFLOW_CERTIFICATION_EVENT_DEFINITIONS,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(MAK_WORKFLOW_CERTIFICATION_CATALOG),
    keyPrefix: "wfcert",
    moduleId: "workflowcert",
  }),
};

export default workflowCertModuleMetadata;

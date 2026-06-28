/**
 * Módulo fictício de certificação — Actions Configuration Engine V19.
 */
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";
import {
  MAK_ACTION_CERTIFICATION_CATALOG,
  MAK_ACTION_CERTIFICATION_LAYOUT,
  MAK_ACTION_CERTIFICATION_DEFINITIONS,
  MAK_ACTION_CERTIFICATION_EVENT_DEFINITIONS,
} from "@/framework/mak/actions/actionCertificationCatalog.js";

export const actionCertModuleMetadata = {
  form: buildMakFormMetadata({
    basePanels: [{ id: "principais", label: "Ações" }],
    defaultLayout: MAK_ACTION_CERTIFICATION_LAYOUT,
    buildEmptyRecord: () =>
      Object.fromEntries(
        MAK_ACTION_CERTIFICATION_CATALOG.map((field) => [
          field.name,
          field.type === "number" ? 0 : "",
        ])
      ),
    buildDefaultConfig: () => ({
      version: 3,
      panels: [{ id: "principais", label: "Ações" }],
      layout: MAK_ACTION_CERTIFICATION_LAYOUT,
    }),
    fieldDefinitions: MAK_ACTION_CERTIFICATION_CATALOG,
    actionDefinitions: MAK_ACTION_CERTIFICATION_DEFINITIONS,
    eventDefinitions: MAK_ACTION_CERTIFICATION_EVENT_DEFINITIONS,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(MAK_ACTION_CERTIFICATION_CATALOG),
    keyPrefix: "actcert",
    moduleId: "actionscert",
  }),
};

export default actionCertModuleMetadata;

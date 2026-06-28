/**
 * Módulo fictício de certificação — Events Configuration Engine V18.
 */
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";
import {
  MAK_EVENT_CERTIFICATION_CATALOG,
  MAK_EVENT_CERTIFICATION_LAYOUT,
  MAK_EVENT_CERTIFICATION_DEFINITIONS,
} from "@/framework/mak/events/eventCertificationCatalog.js";

export const eventCertModuleMetadata = {
  form: buildMakFormMetadata({
    basePanels: [{ id: "principais", label: "Eventos" }],
    defaultLayout: MAK_EVENT_CERTIFICATION_LAYOUT,
    buildEmptyRecord: () =>
      Object.fromEntries(
        MAK_EVENT_CERTIFICATION_CATALOG.map((field) => [
          field.name,
          field.type === "number" ? 0 : "",
        ])
      ),
    buildDefaultConfig: () => ({
      version: 3,
      panels: [{ id: "principais", label: "Eventos" }],
      layout: MAK_EVENT_CERTIFICATION_LAYOUT,
    }),
    fieldDefinitions: MAK_EVENT_CERTIFICATION_CATALOG,
    eventDefinitions: MAK_EVENT_CERTIFICATION_DEFINITIONS,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(MAK_EVENT_CERTIFICATION_CATALOG),
    keyPrefix: "evtcert",
    moduleId: "eventscert",
  }),
};

export default eventCertModuleMetadata;

/**
 * Módulo fictício de certificação — Validation Configuration Engine V16.
 */
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";
import {
  MAK_VALIDATION_CERTIFICATION_CATALOG,
  MAK_VALIDATION_CERTIFICATION_LAYOUT,
} from "@/framework/mak/validation/validationCertificationCatalog.js";

export const validationCertModuleMetadata = {
  form: buildMakFormMetadata({
    basePanels: [{ id: "principais", label: "Validações" }],
    defaultLayout: MAK_VALIDATION_CERTIFICATION_LAYOUT,
    buildEmptyRecord: () =>
      Object.fromEntries(MAK_VALIDATION_CERTIFICATION_CATALOG.map((field) => [field.name, ""])),
    buildDefaultConfig: () => ({
      version: 3,
      panels: [{ id: "principais", label: "Validações" }],
      layout: MAK_VALIDATION_CERTIFICATION_LAYOUT,
    }),
    fieldDefinitions: MAK_VALIDATION_CERTIFICATION_CATALOG,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(MAK_VALIDATION_CERTIFICATION_CATALOG),
    keyPrefix: "valcert",
    moduleId: "validationcert",
  }),
};

export default validationCertModuleMetadata;

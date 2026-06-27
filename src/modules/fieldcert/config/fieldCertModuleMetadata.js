/**
 * Módulo fictício V14 — certificação da Field Configuration Engine.
 * Não roteado no App; consumido por gates e documentação.
 */
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";
import {
  MAK_FIELD_CERTIFICATION_CATALOG,
  MAK_FIELD_CERTIFICATION_LAYOUT,
} from "@/framework/mak/fieldConfig/fieldCertificationCatalog.js";

export const fieldCertModuleMetadata = {
  form: {
    fieldDefinitions: MAK_FIELD_CERTIFICATION_CATALOG,
    defaultLayout: MAK_FIELD_CERTIFICATION_LAYOUT,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(MAK_FIELD_CERTIFICATION_CATALOG),
    buildEmptyRecord: () =>
      Object.fromEntries(MAK_FIELD_CERTIFICATION_CATALOG.map((field) => [field.name, ""])),
  },
};

export default fieldCertModuleMetadata;

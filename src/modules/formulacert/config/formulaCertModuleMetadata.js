/**
 * Módulo fictício de certificação — Formula Configuration Engine V17.
 */
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";
import {
  MAK_FORMULA_CERTIFICATION_CATALOG,
  MAK_FORMULA_CERTIFICATION_LAYOUT,
} from "@/framework/mak/formula/formulaCertificationCatalog.js";

export const formulaCertModuleMetadata = {
  form: buildMakFormMetadata({
    basePanels: [{ id: "principais", label: "Fórmulas" }],
    defaultLayout: MAK_FORMULA_CERTIFICATION_LAYOUT,
    buildEmptyRecord: () =>
      Object.fromEntries(
        MAK_FORMULA_CERTIFICATION_CATALOG.map((field) => [field.name, field.type === "number" ? 0 : ""])
      ),
    buildDefaultConfig: () => ({
      version: 3,
      panels: [{ id: "principais", label: "Fórmulas" }],
      layout: MAK_FORMULA_CERTIFICATION_LAYOUT,
    }),
    fieldDefinitions: MAK_FORMULA_CERTIFICATION_CATALOG,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(MAK_FORMULA_CERTIFICATION_CATALOG),
    keyPrefix: "frmcert",
    moduleId: "formulacert",
  }),
};

export default formulaCertModuleMetadata;

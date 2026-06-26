/**
 * Metadata declarativa do módulo Marcas — certificação Enterprise V7.
 */
import { buildMakTableMetadata } from "@/framework/mak/metadata/buildMakTableMetadata.js";
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakPageMetadata } from "@/framework/mak/metadata/buildMakPageMetadata.js";
import {
  MAR_COLUNAS_BASE,
  MAR_FORM_BASE_PANELS,
  MAR_FORM_DEFAULT_LAYOUT,
  MAR_NATIVE_FIELDS,
  MAR_REQUIRED_FIELDS,
  MAR_UPPER_FIELDS,
  applyDuplicateFieldClears,
  buildEmptyMarcaForm,
  buildMarFormDefaultConfig,
  inputClass,
} from "@/modules/marcas/config/marForm.constants.js";

export const marcasModuleMetadata = {
  table: buildMakTableMetadata({
    columns: MAR_COLUNAS_BASE,
    keyPrefix: "mar",
    defaultSort: { key: "codigo", direction: "asc" },
  }),
  form: buildMakFormMetadata({
    basePanels: MAR_FORM_BASE_PANELS,
    defaultLayout: MAR_FORM_DEFAULT_LAYOUT,
    buildEmptyRecord: buildEmptyMarcaForm,
    buildDefaultConfig: buildMarFormDefaultConfig,
    requiredFields: MAR_REQUIRED_FIELDS,
    upperFields: MAR_UPPER_FIELDS,
    nativeFields: MAR_NATIVE_FIELDS,
    inputClass,
    applyDuplicateFieldClears,
  }),
  search: {
    titleField: "nome",
    primaryField: "nome",
    codeField: "codigo",
    cardFields: [
      { key: "codigo", label: "Código", column: "codigo" },
      { key: "nome", label: "Nome", column: "nome" },
      { key: "status", label: "Status", column: "status" },
    ],
  },
  list: {
    queryKey: ["mar-cadastro"],
    defaultPageSize: 50,
  },
  page: buildMakPageMetadata(),
};

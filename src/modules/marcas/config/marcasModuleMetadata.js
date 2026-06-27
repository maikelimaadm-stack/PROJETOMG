/**
 * Metadata declarativa do módulo Marcas — certificação Enterprise V7.
 */
import { buildMakTableMetadata } from "@/framework/mak/metadata/buildMakTableMetadata.js";
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakPageMetadata } from "@/framework/mak/metadata/buildMakPageMetadata.js";
import { buildMakStandardDynamicFields } from "@/framework/mak/metadata/buildMakStandardDynamicFields.jsx";
import { buildMakSidebarFilterFromColumns } from "@/framework/mak/metadata/buildMakFiltersMetadata.js";
import {
  MAR_COLUNAS_BASE,
  MAR_FORM_BASE_PANELS,
  MAR_FORM_DEFAULT_LAYOUT,
  MAR_FORM_FIELD_DEFS,
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
    buildDynamicFields: buildMakStandardDynamicFields(MAR_FORM_FIELD_DEFS),
    keyPrefix: "mar",
    moduleId: "marcas",
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
    storageKeys: {
      favoritesKey: "mar_search_favorites_v1",
      viewModeKey: "mar_view_mode_v1",
      dropdownVisKey: "mar_search_dropdown_vis_v1",
      cardsVisKey: "mar_search_vis_fields_v2",
      cardsLayoutKey: "mar_cards_layout_v1",
      filterFieldsLayoutKey: "mar_filter_fields_layout_v1",
    },
  },
  filters: {
    sidebar: buildMakSidebarFilterFromColumns(MAR_COLUNAS_BASE, {
      statusOptions: [
        { value: "Todos", label: "Todos" },
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
      ],
    }),
  },
  preferences: {
    moduleId: "marcas",
    keyPrefix: "mar",
  },
  list: {
    queryKey: ["mar-cadastro"],
    defaultPageSize: 50,
  },
  page: buildMakPageMetadata(),
};

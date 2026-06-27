import { buildMakTableMetadata } from "@/framework/mak/metadata/buildMakTableMetadata.js";
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakPageMetadata } from "@/framework/mak/metadata/buildMakPageMetadata.js";
import { buildMakStandardDynamicFields } from "@/framework/mak/metadata/buildMakStandardDynamicFields.jsx";
import { buildMakSidebarFilterFromColumns } from "@/framework/mak/metadata/buildMakFiltersMetadata.js";
import {
  PRO_COLUNAS_BASE,
  PRO_FORM_BASE_PANELS,
  PRO_FORM_DEFAULT_LAYOUT,
  PRO_FORM_FIELD_DEFS,
  PRO_NATIVE_FIELDS,
  PRO_REQUIRED_FIELDS,
  PRO_UPPER_FIELDS,
  applyDuplicateFieldClears,
  buildEmptyProdutoForm,
  buildProFormDefaultConfig,
  inputClass,
} from "@/modules/produtos/config/proForm.constants.js";

export const produtosModuleMetadata = {
  table: buildMakTableMetadata({
    columns: PRO_COLUNAS_BASE,
    keyPrefix: "pro",
    defaultSort: { key: "codigo", direction: "asc" },
  }),
  form: buildMakFormMetadata({
    basePanels: PRO_FORM_BASE_PANELS,
    defaultLayout: PRO_FORM_DEFAULT_LAYOUT,
    buildEmptyRecord: buildEmptyProdutoForm,
    buildDefaultConfig: buildProFormDefaultConfig,
    requiredFields: PRO_REQUIRED_FIELDS,
    upperFields: PRO_UPPER_FIELDS,
    nativeFields: PRO_NATIVE_FIELDS,
    inputClass,
    applyDuplicateFieldClears,
    buildDynamicFields: buildMakStandardDynamicFields(PRO_FORM_FIELD_DEFS),
    keyPrefix: "pro",
    moduleId: "produtos",
  }),
  search: {
    titleField: "nome",
    primaryField: "nome",
    codeField: "codigo",
    cardFields: [
      { key: "codigo", label: "Código", column: "codigo" },
      { key: "nome", label: "Nome", column: "nome" },
      { key: "status", label: "Status", column: "status" },
      { key: "preco", label: "Preço", column: "preco" },
    ],
    storageKeys: {
      favoritesKey: "pro_search_favorites_v1",
      viewModeKey: "pro_view_mode_v1",
      dropdownVisKey: "pro_search_dropdown_vis_v1",
      cardsVisKey: "pro_search_vis_fields_v2",
      cardsLayoutKey: "pro_cards_layout_v1",
      filterFieldsLayoutKey: "pro_filter_fields_layout_v1",
    },
  },
  filters: {
    sidebar: buildMakSidebarFilterFromColumns(PRO_COLUNAS_BASE, {
      statusOptions: [
        { value: "Todos", label: "Todos" },
        { value: "Ativo", label: "Ativo" },
        { value: "Inativo", label: "Inativo" },
      ],
    }),
  },
  preferences: {
    moduleId: "produtos",
    keyPrefix: "pro",
  },
  list: {
    queryKey: ["pro-cadastro"],
    defaultPageSize: 50,
  },
  page: buildMakPageMetadata(),
};

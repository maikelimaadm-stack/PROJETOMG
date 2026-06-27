import { buildMakTableMetadata } from "@/framework/mak/metadata/buildMakTableMetadata.js";
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakPageMetadata } from "@/framework/mak/metadata/buildMakPageMetadata.js";
import {
  applyDuplicateFieldClears,
  buildCpsFormDefaultConfig,
  buildEmptyCadcpsForm,
  CPS_COLUNAS_BASE,
  CPS_FORM_BASE_PANELS,
  CPS_FORM_DEFAULT_LAYOUT,
  CPS_NATIVE_FIELDS,
  CPS_REQUIRED_FIELDS,
  CPS_UPPER_FIELDS,
  inputClass,
} from "@/modules/cadcps/config/cpsForm.constants.js";
import {
  buildCadcpsDynamicFields,
  mapCadcpsRecordToForm,
  prepareCadcpsSubmitPayload,
  validateCadcpsFormExtra,
} from "@/modules/cadcps/runtime/cadcpsFormRuntime.jsx";
import {
  resolveCadcpsComparableValue,
  resolveCadcpsFieldValue,
} from "@/modules/cadcps/runtime/cadcpsTableRuntime.js";
import useCadcpsFormResources from "@/modules/cadcps/runtime/useCadcpsFormResources.js";
import { buildMakSidebarFilterFromColumns } from "@/framework/mak/metadata/buildMakFiltersMetadata.js";

export const cadcpsModuleMetadata = {
  table: buildMakTableMetadata({
    columns: CPS_COLUNAS_BASE,
    keyPrefix: "cps",
    defaultSort: { key: "codigo", direction: "asc" },
    resolveFieldValue: resolveCadcpsFieldValue,
    resolveComparableValue: resolveCadcpsComparableValue,
  }),
  form: buildMakFormMetadata({
    basePanels: CPS_FORM_BASE_PANELS,
    defaultLayout: CPS_FORM_DEFAULT_LAYOUT,
    buildEmptyRecord: buildEmptyCadcpsForm,
    buildDefaultConfig: buildCpsFormDefaultConfig,
    requiredFields: CPS_REQUIRED_FIELDS,
    upperFields: CPS_UPPER_FIELDS,
    nativeFields: CPS_NATIVE_FIELDS,
    inputClass,
    applyDuplicateFieldClears,
    buildDynamicFields: buildCadcpsDynamicFields,
    mapRecordToForm: mapCadcpsRecordToForm,
    prepareSubmitPayload: prepareCadcpsSubmitPayload,
    validateFormExtra: validateCadcpsFormExtra,
    useFormResourcesHook: useCadcpsFormResources,
    keyPrefix: "cps",
    moduleId: "cadcps",
  }),
  search: {
    titleField: "nome",
    primaryField: "nome",
    codeField: "codigo",
    cardFields: [
      { key: "codigo", label: "Código", column: "codigo" },
      { key: "nome", label: "Nome", column: "nome" },
      { key: "tipo", label: "Tipo", column: "tipo" },
      { key: "ativo", label: "Ativo", column: "ativo" },
    ],
    storageKeys: {
      favoritesKey: "cps_search_favorites_v1",
      viewModeKey: "cps_view_mode_v1",
      dropdownVisKey: "cps_search_dropdown_vis_v1",
      cardsVisKey: "cps_search_vis_fields_v2",
      cardsLayoutKey: "cps_cards_layout_v1",
      filterFieldsLayoutKey: "cps_filter_fields_layout_v1",
    },
  },
  filters: {
    sidebar: buildMakSidebarFilterFromColumns(CPS_COLUNAS_BASE, {
      statusKey: "ativo",
      statusLabel: "Ativo",
      statusOptions: [
        { value: "Todos", label: "Todos" },
        { value: "Sim", label: "Sim" },
        { value: "Não", label: "Não" },
      ],
    }),
  },
  preferences: {
    moduleId: "cadcps",
    keyPrefix: "cps",
  },
  list: {
    queryKey: ["cps-cadastro"],
    defaultPageSize: 50,
  },
  page: buildMakPageMetadata(),
};

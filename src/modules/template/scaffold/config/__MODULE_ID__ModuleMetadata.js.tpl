import { buildMakTableMetadata } from "@/framework/mak/metadata/buildMakTableMetadata.js";
import { buildMakFormMetadata } from "@/framework/mak/metadata/buildMakFormMetadata.js";
import { buildMakPageMetadata } from "@/framework/mak/metadata/buildMakPageMetadata.js";
import { buildMakDynamicFieldsFromMetadata } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsFromMetadata.js";
import {
  __KEY_PREFIX_UPPER___COLUNAS_BASE,
  __KEY_PREFIX_UPPER___FORM_BASE_PANELS,
  __KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT,
  __KEY_PREFIX_UPPER___FORM_FIELD_DEFS,
  __KEY_PREFIX_UPPER___EVENT_DEFINITIONS,
  __KEY_PREFIX_UPPER___ACTION_DEFINITIONS,
  __KEY_PREFIX_UPPER___NATIVE_FIELDS,
  __KEY_PREFIX_UPPER___REQUIRED_FIELDS,
  __KEY_PREFIX_UPPER___UPPER_FIELDS,
  applyDuplicateFieldClears,
  buildEmpty__MODULE_ID_PASCAL__Form,
  build__KEY_PREFIX_PASCAL__FormDefaultConfig,
  inputClass,
} from "@/modules/__MODULE_ID__/config/__KEY_PREFIX__Form.constants.js";

export const __MODULE_ID__ModuleMetadata = {
  table: buildMakTableMetadata({
    columns: __KEY_PREFIX_UPPER___COLUNAS_BASE,
    keyPrefix: "__KEY_PREFIX__",
    defaultSort: { key: "codigo", direction: "asc" },
  }),
  form: buildMakFormMetadata({
    basePanels: __KEY_PREFIX_UPPER___FORM_BASE_PANELS,
    defaultLayout: __KEY_PREFIX_UPPER___FORM_DEFAULT_LAYOUT,
    buildEmptyRecord: buildEmpty__MODULE_ID_PASCAL__Form,
    buildDefaultConfig: build__KEY_PREFIX_PASCAL__FormDefaultConfig,
    requiredFields: __KEY_PREFIX_UPPER___REQUIRED_FIELDS,
    upperFields: __KEY_PREFIX_UPPER___UPPER_FIELDS,
    nativeFields: __KEY_PREFIX_UPPER___NATIVE_FIELDS,
    inputClass,
    applyDuplicateFieldClears,
    fieldDefinitions: __KEY_PREFIX_UPPER___FORM_FIELD_DEFS,
    eventDefinitions: __KEY_PREFIX_UPPER___EVENT_DEFINITIONS,
    actionDefinitions: __KEY_PREFIX_UPPER___ACTION_DEFINITIONS,
    buildDynamicFields: buildMakDynamicFieldsFromMetadata(__KEY_PREFIX_UPPER___FORM_FIELD_DEFS),
    keyPrefix: "__KEY_PREFIX__",
    moduleId: "__MODULE_ID__",
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
    queryKey: ["__KEY_PREFIX__-cadastro"],
    defaultPageSize: 50,
  },
  page: buildMakPageMetadata(),
};

/**
 * Metadata declarativa do módulo Empresas — consumida por defineMakModule().
 * Substitui acoplamento tblEmp.* / formEmp.* dentro da MAK Foundation.
 */
import {
  AGGR_KEY,
  AUTO_FIT_MEASURE_LIMIT,
  COLUNAS_BASE,
  FILTER_POPOVER_WIDTH,
  FROZEN_KEY,
  MAX_AUTO_FIT_WIDTH,
  MIN_COL_WIDTH,
  ORDER_KEY,
  PAGE_SIZE_KEY,
  ROW_DBLCLICK_OPEN_MS,
  ROW_DBLCLICK_PAIR_MS,
  SIZING_MODE_KEY,
  SORT_KEY,
  VISIBLE_KEY,
  WIDTHS_KEY,
  formatHeaderLabel,
  getMinWidth,
} from "@/modules/empresas/components/tblEmp.constants";
import {
  buildEmptyEmpresaForm,
  buildEmpFormDefaultConfig,
  EMP_FORM_BASE_PANELS,
  EMP_FORM_DEFAULT_LAYOUT,
  ESTADOS_BR,
  NATIVE_FIELDS,
  REQUIRED_FIELDS,
  UPPER_FIELDS,
  applyDuplicateFieldClears,
  inputClass,
} from "@/modules/empresas/components/formEmp.constants";
import { buildColunasDisponiveis, loadSavedVisibleColumns, mergeEffectiveColumnLayout } from "@/modules/empresas/utils/empTableColumnCatalog";
import {
  createDefaultColumnFilter,
  evaluateColumnFilter,
  filterNeedsClientSideProcessing,
  getColumnFilterType,
  hasClientOnlyColumnFilters,
  normalizeLegacyColumnFilter,
  parseDateFilterValue,
} from "@/modules/empresas/components/tblEmp.filters";
import { useEmpCamposPersonalizados } from "@/modules/empresas/hooks/useEmpCamposPersonalizados";
import { useFormEmpCustomFields } from "@/modules/empresas/components/formEmp.customFields";
import {
  readStoredFilterOperators,
  writeStoredFilterOperators,
  writeStoredTempListagemFilters,
  readStoredLaunchPanelStyle,
  writeStoredLaunchPanelStyle,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";
import {
  buildColumnSizingModeFromAutoFit,
  mergeColumnSizingMode,
  readEmpTablePreferencesSnapshot,
} from "@/modules/empresas/preferences/empTablePreferencesHydration";
import { emitEmpPreferencesCacheUpdate } from "@/modules/empresas/preferences/empresasPreferencesCache";

export const empresasModuleMetadata = {
  table: {
    columns: COLUNAS_BASE,
    defaultSort: { key: "codempresa", direction: "asc" },
    constants: {
      FILTER_POPOVER_WIDTH,
      MIN_COL_WIDTH,
      MAX_AUTO_FIT_WIDTH,
      AUTO_FIT_MEASURE_LIMIT,
      ROW_DBLCLICK_OPEN_MS,
      ROW_DBLCLICK_PAIR_MS,
      formatHeaderLabel,
      getMinWidth,
    },
    preferenceKeys: {
      WIDTHS_KEY,
      FROZEN_KEY,
      VISIBLE_KEY,
      ORDER_KEY,
      AGGR_KEY,
      PAGE_SIZE_KEY,
      SORT_KEY,
      SIZING_MODE_KEY,
    },
    catalog: {
      buildColumnCatalog: buildColunasDisponiveis,
      loadSavedVisibleColumns,
      mergeEffectiveColumnLayout,
    },
    filterHelpers: {
      createDefaultColumnFilter,
      evaluateColumnFilter,
      filterNeedsClientSideProcessing,
      getColumnFilterType,
      hasClientOnlyColumnFilters,
      normalizeLegacyColumnFilter,
      parseDateFilterValue,
    },
    hydration: {
      readTablePreferencesSnapshot: readEmpTablePreferencesSnapshot,
      buildColumnSizingModeFromAutoFit,
      mergeColumnSizingMode,
    },
    storage: {
      readStoredFilterOperators,
      writeStoredFilterOperators,
      writeStoredTempListagemFilters,
    },
    useCustomFieldsHook: useEmpCamposPersonalizados,
    emitCacheUpdate: emitEmpPreferencesCacheUpdate,
  },
  form: {
    estados: ESTADOS_BR,
    upperFields: UPPER_FIELDS,
    requiredFields: REQUIRED_FIELDS,
    nativeFields: NATIVE_FIELDS,
    inputClass,
    basePanels: EMP_FORM_BASE_PANELS,
    defaultLayout: EMP_FORM_DEFAULT_LAYOUT,
    buildDefaultConfig: buildEmpFormDefaultConfig,
    buildEmptyRecord: buildEmptyEmpresaForm,
    applyDuplicateFieldClears,
    useRecordFieldsHook: useEmpCamposPersonalizados,
    useCustomFieldsHook: useFormEmpCustomFields,
    storage: {
      readStoredLaunchPanelStyle,
      writeStoredLaunchPanelStyle,
    },
  },
  preferences: {
    moduleId: "empresas",
    keyPrefix: "emp",
  },
};

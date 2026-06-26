/**
 * Empresas — configuração searchView para hooks genéricos do ModeloBase1.
 * Apenas dados/funções de domínio; lógica de hook está em ModeloBase1.
 */
import {
  EMP_SEARCH_VIS_KEY,
  EMP_SEARCH_DROPDOWN_VIS_KEY,
  EMP_SEARCH_FAV_KEY,
  EMP_CARDS_LAYOUT_KEY,
  EMP_CARDS_LAYOUT_DEFAULT,
  EMP_SEARCH_DEFAULT_FIELDS,
  buildEmpCardFieldCatalog,
  buildSearchDropdownDetailFields,
  getDefaultCardVisFields,
  loadCardsLayoutConfig,
  loadCardFieldOrder,
  loadSearchDropdownVisFields,
  loadSearchVisFields,
  mergeSearchVisFields,
  normalizeCardsPerRow,
  saveCardsLayoutConfig,
  saveSearchDropdownVisFields,
  saveSearchVisFields,
  loadSearchFavorites,
  saveSearchFavorites,
  getEmpSearchFieldValue,
  sortCardConfigFieldsAlphabetically,
  sortCardConfigFieldsByOrder,
  getFieldsPerRowForLayout,
} from "@/modules/empresas/components/empSearchView.constants";
import {
  applyFilterFieldsLayout,
  getDefaultFilterFieldsLayout,
  loadFilterFieldsLayout,
  mergeSavedFilterFieldOrder,
  mergeSavedVisibleFilterFields,
  saveFilterFieldsLayout,
  EMP_FILTER_FIELDS_LAYOUT_KEY,
} from "@/modules/empresas/utils/empFilterFieldsLayout";
import { empresasPreferencesAdapter } from "@/modules/empresas/config/empresasPreferencesAdapter";
import { EMP_VIEW_MODE_STORAGE_KEY } from "@/modules/empresas/preferences/empresasPreferencesStorage";
import empRepository from "@/modules/empresas/repositories/empRepository";
import { EMPRESAS_LIST_QUERY_KEY, EMP_INFINITE_PAGE_SIZE } from "@/modules/empresas/data/empresasListConstants";
import {
  EMP_LOAD_BATCH_STORAGE_KEY,
  EMP_LOAD_BATCH_OPTIONS,
  EMP_MAX_LOADED_ROWS,
  readStoredEmpLoadBatchSize,
} from "@/modules/empresas/hooks/useEmpresasInfiniteData";

export const empresasSearchViewConfig = {
  favoritesKey: EMP_SEARCH_FAV_KEY,
  favoritesUpdatedEvent: "emp-favorites-updated",
  viewModeKey: EMP_VIEW_MODE_STORAGE_KEY,
  viewModeUpdatedEvent: "emp-view-mode-updated",
  dropdownVisKey: EMP_SEARCH_DROPDOWN_VIS_KEY,
  cardsVisKey: EMP_SEARCH_VIS_KEY,
  cardsLayoutKey: EMP_CARDS_LAYOUT_KEY,
  cardsLayoutDefault: EMP_CARDS_LAYOUT_DEFAULT,
  filterFieldsLayoutKey: EMP_FILTER_FIELDS_LAYOUT_KEY,
  filterFieldsLayoutUpdatedEvent: "emp-filter-fields-layout-updated",
  defaultFields: EMP_SEARCH_DEFAULT_FIELDS,
  buildCardCatalog: buildEmpCardFieldCatalog,
  mergeSearchVisFields,
  loadSearchDropdownVisFields,
  saveSearchDropdownVisFields,
  loadSearchVisFields,
  saveSearchVisFields,
  loadCardsLayoutConfig,
  saveCardsLayoutConfig,
  normalizeCardsPerRow,
  getFieldsPerRowForLayout,
  sortCardFieldsAlphabetically: sortCardConfigFieldsAlphabetically,
  sortCardConfigFieldsByOrder,
  loadCardFieldOrder,
  buildSearchDropdownDetailFields,
  getDefaultCardVisFields,
  loadFilterFieldsLayout,
  saveFilterFieldsLayout,
  applyFilterFieldsLayout,
  getDefaultFilterFieldsLayout,
  mergeSavedVisibleFilterFields,
  mergeSavedFilterFieldOrder,
  loadSearchFavorites,
  saveSearchFavorites,
  formatSearchFieldValue: getEmpSearchFieldValue,
};

export const empresasCustomFieldsConfig = {
  queryKeyPrefix: "emp-campos-personalizados",
  listFn: (scope) => empRepository.listCamposPersonalizados(scope),
  resolveScopeId: (auth) => auth.selectedEmpresaId,
};

export const empresasDataConfig = {
  listQueryKey: EMPRESAS_LIST_QUERY_KEY,
  infinitePageSize: EMP_INFINITE_PAGE_SIZE,
  loadBatchStorageKey: EMP_LOAD_BATCH_STORAGE_KEY,
  loadBatchOptions: EMP_LOAD_BATCH_OPTIONS,
  maxLoadedRows: EMP_MAX_LOADED_ROWS,
  readStoredLoadBatchSize: readStoredEmpLoadBatchSize,
};

export { empresasPreferencesAdapter };

/**
 * Empresas — dados de domínio para ModeloBase1 (sem searchView estrutural).
 * searchView é derivado via buildSearchViewFromMakModule(empresasMakModule).
 */
import { empresasPreferencesAdapter } from "@/modules/empresas/config/empresasPreferencesAdapter";
import empRepository from "@/modules/empresas/repositories/empRepository";
import { EMPRESAS_LIST_QUERY_KEY, EMP_INFINITE_PAGE_SIZE } from "@/modules/empresas/data/empresasListConstants";
import {
  EMP_LOAD_BATCH_STORAGE_KEY,
  EMP_LOAD_BATCH_OPTIONS,
  EMP_MAX_LOADED_ROWS,
  readStoredEmpLoadBatchSize,
} from "@/modules/empresas/hooks/useEmpresasInfiniteData";

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

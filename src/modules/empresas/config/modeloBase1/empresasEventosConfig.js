/**
 * Empresas — eventos / handlers de domínio (search, listagem infinita, favoritos).
 */
export { useEmpSearchDropdownFields } from "@/modules/empresas/hooks/useEmpSearchDropdownFields";
export { useEmpFavorites } from "@/modules/empresas/hooks/useEmpFavorites";
export {
  EMP_INFINITE_PAGE_SIZE,
  EMP_LOAD_BATCH_STORAGE_KEY,
  readStoredEmpLoadBatchSize,
  useEmpresasInfiniteData,
} from "@/modules/empresas/hooks/useEmpresasInfiniteData";

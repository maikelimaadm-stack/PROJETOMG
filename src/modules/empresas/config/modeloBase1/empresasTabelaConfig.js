/**
 * Empresas — configuração de tabela (colunas, prefs, filtros de coluna).
 */
export {
  COLUNAS_BASE as EMP_COLUNAS_BASE,
  SORT_KEY as EMP_SORT_KEY,
  PAGE_SIZE_KEY as EMP_PAGE_SIZE_KEY,
} from "@/modules/empresas/components/tblEmp.constants";

export { buildColunasDisponiveis, loadSavedVisibleColumns } from "@/modules/empresas/utils/empTableColumnCatalog";

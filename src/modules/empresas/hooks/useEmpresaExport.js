import { useCallback, useState } from "react";
import { showSuccess, showError } from "@/shared/feedback";
import { printCadastroTable } from "@/framework/cadastro/exports/tableExportUtils";
import { normalizeSearchQuery } from "@/shared/utils/normalizeSearchQuery";
import { buildEmpresaExportRows } from "@/modules/empresas/utils/empExportRows";
import { getEmpPdfExportConfig } from "@/modules/empresas/config/empPdfExportConfig";

/**
 * Exportação PDF/Excel da listagem Empresas.
 */
export function useEmpresaExport({
  moduleRepository,
  moduleLabels,
  saveCycle,
  resolveErrorMessage,
  searchTerm,
  querySort,
  listFilters,
  selectedTableItems,
  pinnedRecord,
  visibleTableData,
}) {
  const [exportBusy, setExportBusy] = useState(false);
  const [exportMessage, setExportMessage] = useState("");

  const buildExportParams = useCallback(
    (format) => ({
      format,
      search: normalizeSearchQuery(searchTerm),
      sortBy: querySort.key,
      sortDir: querySort.direction,
      filters: JSON.stringify(listFilters ?? {}),
      ...(selectedTableItems.length > 0 ? { ids: selectedTableItems.join(",") } : {}),
    }),
    [searchTerm, querySort, listFilters, selectedTableItems]
  );

  const handleExportPdf = useCallback(async () => {
    if (exportBusy || !saveCycle.guardAction("Aguarde a exportação terminar.")) return;
    if (pinnedRecord) {
      const config = getEmpPdfExportConfig();
      const srcCols = config.useConfiguredColumns
        ? visibleTableData.allColumns || visibleTableData.columns
        : visibleTableData.columns;
      const selCols =
        config.useConfiguredColumns && config.columnIds.length
          ? srcCols.filter((c) => config.columnIds.includes(c.id))
          : srcCols;
      const rows = buildEmpresaExportRows([pinnedRecord], selCols);
      printCadastroTable({
        columns: selCols,
        rows,
        totalRows: [],
        title: `${moduleLabels.title} - ${new Date().toLocaleDateString("pt-BR")}`,
      });
      return;
    }
    setExportBusy(true);
    setExportMessage("Preparando exportação...");
    try {
      await moduleRepository.downloadExport(buildExportParams("csv"));
      showSuccess("Exportação concluída.");
    } catch (error) {
      showError(resolveErrorMessage(error, "Não foi possível exportar."));
    } finally {
      setExportBusy(false);
      setExportMessage("");
    }
  }, [
    buildExportParams,
    exportBusy,
    moduleLabels.title,
    moduleRepository,
    pinnedRecord,
    resolveErrorMessage,
    saveCycle,
    visibleTableData,
  ]);

  const handleExportExcel = useCallback(async () => {
    if (exportBusy || !saveCycle.guardAction("Aguarde a exportação terminar.")) return;
    setExportBusy(true);
    setExportMessage("Preparando exportação...");
    try {
      await moduleRepository.downloadExport(buildExportParams("excel"));
      showSuccess("Exportação concluída.");
    } catch (error) {
      showError(resolveErrorMessage(error, "Não foi possível exportar."));
    } finally {
      setExportBusy(false);
      setExportMessage("");
    }
  }, [buildExportParams, exportBusy, moduleRepository, resolveErrorMessage, saveCycle]);

  return {
    exportBusy,
    exportMessage,
    handleExportPdf,
    handleExportExcel,
  };
}

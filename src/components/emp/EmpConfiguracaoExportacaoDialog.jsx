import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import { saveEmpExcelExportConfig, saveEmpPdfExportConfig } from "@/components/emp/empPdfExportConfig";

export default function EmpConfiguracaoExportacaoDialog({ open, onOpenChange, columns = [], initialConfig, tipo = "pdf" }) {
  const [useConfiguredColumns, setUseConfiguredColumns] = useState(false);
  const [columnIds, setColumnIds] = useState([]);

  useEffect(() => {
    setUseConfiguredColumns(Boolean(initialConfig?.useConfiguredColumns));
    setColumnIds(initialConfig?.columnIds?.length ? initialConfig.columnIds : columns.map((c) => c.id));
  }, [initialConfig, columns, open]);

  const saveConfig = (config) => tipo === "excel" ? saveEmpExcelExportConfig(config) : saveEmpPdfExportConfig(config);
  const handleUseConfiguredColumnsChange = (checked) => { setUseConfiguredColumns(checked); saveConfig({ useConfiguredColumns: checked, columnIds }); };
  const toggleColumn = (id) => setColumnIds((prev) => { const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]; saveConfig({ useConfiguredColumns, columnIds: next }); return next; });
  const titulo = tipo === "excel" ? "Configuração da exportação Excel" : "Configuração da exportação PDF";

  return (
    <Dialog open={open} onOpenChange={(o) => o && onOpenChange(o)}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="bg-transparent fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-1rem)] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden border-0 shadow-lg sm:w-full rounded-none sm:rounded-none sm:p-0 max-w-[760px]">
        <DialogTitle className="sr-only">{titulo}</DialogTitle>
        <div className="bg-white border border-slate-200">
          <div className="h-8 flex items-center gap-2 border-b border-slate-200 px-2">
            <span className="w-[70px] h-5 px-1.5 rounded-none border border-slate-300 bg-white text-slate-500 text-[11px] font-bold text-center truncate inline-flex items-center justify-center">{tipo === "excel" ? "EXCEL" : "PDF"}</span>
            <span className="text-xs font-semibold text-slate-500 truncate flex-1">{titulo}</span>
            <Button type="button" onClick={() => onOpenChange(false)} className="rounded-none border border-slate-300 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-600 shadow-none h-7 w-7"><X className="w-4 h-4" /></Button>
          </div>
          <div className="mx-3 my-1">
            <label className="text-xs text-slate-500 items-center flex gap-2">
              <ToggleSwitch checked={useConfiguredColumns} onChange={handleUseConfiguredColumnsChange} />
              <span className="truncate">Sempre exportar as colunas selecionadas abaixo</span>
            </label>
          </div>
          <div className="border-t border-slate-200 rounded-none max-h-72 overflow-auto">
            {columns.map((col) =>
              <label key={col.id} className="flex items-center gap-2 px-3 py-2 text-xs border-b border-slate-200 last:border-b-0 hover:bg-slate-50 rounded-none">
                <ToggleSwitch checked={columnIds.includes(col.id)} onChange={() => toggleColumn(col.id)} />
                <span className="truncate text-slate-500">{col.label}</span>
              </label>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
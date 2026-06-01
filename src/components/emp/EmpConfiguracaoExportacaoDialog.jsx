import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { X } from "lucide-react";
import ToggleSwitch from "@/components/common/ToggleSwitch";
import { saveEmpExcelExportConfig, saveEmpPdfExportConfig } from "@/components/emp/empPdfExportConfig";
import {
  EMP_CONFIG_DIALOG_BADGE,
  EMP_CONFIG_DIALOG_CONTENT,
  EMP_CONFIG_DIALOG_HEADER,
  EMP_CONFIG_DIALOG_ICON_BTN,
  EMP_CONFIG_DIALOG_TITLE,
} from "@/components/emp/dialogs/empConfigDialogStyles";

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
      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className={`${EMP_CONFIG_DIALOG_CONTENT} max-w-[760px] [&>button:last-child]:hidden`}>
        <DialogTitle className="sr-only">{titulo}</DialogTitle>
        <div className="overflow-hidden bg-white">
          <div className={EMP_CONFIG_DIALOG_HEADER}>
            <span className={`${EMP_CONFIG_DIALOG_BADGE} w-[70px]`}>{tipo === "excel" ? "EXCEL" : "PDF"}</span>
            <span className={EMP_CONFIG_DIALOG_TITLE}>{titulo}</span>
            <Button type="button" onClick={() => onOpenChange(false)} className={EMP_CONFIG_DIALOG_ICON_BTN} title="Fechar">
              <X className="w-4 h-4" />
            </Button>
          </div>
          <div className="border-b border-slate-200 p-3">
            <label className="flex items-center gap-2 text-xs text-slate-600">
              <ToggleSwitch className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" checked={useConfiguredColumns} onChange={handleUseConfiguredColumnsChange} />
              <span className="truncate">Sempre exportar as colunas selecionadas abaixo</span>
            </label>
          </div>
          <div className="m-3 mt-2 max-h-72 overflow-auto rounded-md border border-slate-200">
            {columns.map((col) =>
              <label key={col.id} className="flex h-8 items-center gap-2 border-b border-slate-200 px-3 text-xs text-slate-600 last:border-b-0 hover:bg-slate-50">
                <ToggleSwitch className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" checked={columnIds.includes(col.id)} onChange={() => toggleColumn(col.id)} />
                <span className="truncate">{col.label}</span>
              </label>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
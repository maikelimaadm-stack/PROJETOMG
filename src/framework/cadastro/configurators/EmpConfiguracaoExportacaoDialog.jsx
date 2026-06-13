import React, { useEffect, useState } from "react";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/shared/ui/table";
import { Check, X } from "lucide-react";
import ToggleSwitch from "@/shared/components/ToggleSwitch";
import {
  EMP_CONFIG_DIALOG_CLOSE_BUTTON,
  EMP_CONFIG_DIALOG_CLOSE_ROW,
  EMP_CONFIG_DIALOG_CONTENT,
  EMP_CONFIG_DIALOG_SHELL,
  EMP_CONFIG_DIALOG_TABLE_SHELL,
  EMP_CONFIG_DIALOG_TABLE_WRAP,
  EMP_CONFIG_DIALOG_TOOLBAR,
  EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN,
} from "@/framework/cadastro/styles/empConfigDialogStyles";
import EmpBubbleCounter from "@/framework/cadastro/toolbars/EmpBubbleCounter";
import EmpToolbarIcon from "@/framework/cadastro/toolbars/EmpToolbarIcon";
import EmpToolbarInfoBar from "@/framework/cadastro/toolbars/EmpToolbarInfoBar";
import { EMP_TOOLBAR_BTN } from "@/framework/cadastro/toolbars/empToolbarStyles";
import EmpSplitToolbarLayout from "@/framework/cadastro/layouts/EmpSplitToolbarLayout";

const ToolbarBtn = ({ children, className = "", ...props }) => (
  <button type="button" className={`${EMP_TOOLBAR_BTN} ${className}`} {...props}>
    {children}
  </button>
);

export default function EmpConfiguracaoExportacaoDialog({
  open,
  onOpenChange,
  columns = [],
  initialConfig,
  tipo = "pdf",
  onSaveConfig,
}) {
  const [useConfiguredColumns, setUseConfiguredColumns] = useState(false);
  const [columnIds, setColumnIds] = useState([]);

  useEffect(() => {
    setUseConfiguredColumns(Boolean(initialConfig?.useConfiguredColumns));
    setColumnIds(initialConfig?.columnIds?.length ? initialConfig.columnIds : columns.map((c) => c.id));
  }, [initialConfig, columns, open]);

  const saveConfig = (config) => {
    onSaveConfig?.(config, tipo);
  };
  const handleUseConfiguredColumnsChange = (checked) => { setUseConfiguredColumns(checked); saveConfig({ useConfiguredColumns: checked, columnIds }); };
  const toggleColumn = (id) => setColumnIds((prev) => { const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]; saveConfig({ useConfiguredColumns, columnIds: next }); return next; });
  const selectAllColumns = () => { const next = columns.map((col) => col.id); setColumnIds(next); saveConfig({ useConfiguredColumns, columnIds: next }); };
  const clearColumns = () => { setColumnIds([]); saveConfig({ useConfiguredColumns, columnIds: [] }); };
  const titulo = tipo === "excel" ? "Configuração da exportação Excel" : "Configuração da exportação PDF";
  const badge = tipo === "excel" ? "Excel" : "PDF";

  return (
    <Dialog open={open} onOpenChange={(o) => o && onOpenChange(o)}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className={`${EMP_CONFIG_DIALOG_CONTENT} max-w-[760px]`}>
        <DialogTitle className="sr-only">{titulo}</DialogTitle>

        <div className={EMP_CONFIG_DIALOG_SHELL}>
          <div className={EMP_CONFIG_DIALOG_CLOSE_ROW}>
            <button type="button" onClick={() => onOpenChange(false)} className={EMP_CONFIG_DIALOG_CLOSE_BUTTON} title="Fechar" aria-label="Fechar">
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>

          <EmpSplitToolbarLayout
            toolbar={
              <div className={EMP_CONFIG_DIALOG_TOOLBAR}>
                <ToolbarBtn onClick={selectAllColumns} className={`${EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN} emp-toolbar-btn-new`} title="Selecionar todas">
                  <EmpToolbarIcon icon={Check} strokeWidth={2.5} />
                  <span>Todas</span>
                </ToolbarBtn>
                <ToolbarBtn onClick={clearColumns} className={EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN} title="Limpar seleção">
                  <EmpToolbarIcon icon={X} />
                  <span>Limpar</span>
                </ToolbarBtn>
                <div className="ml-auto flex items-center gap-1 pr-1">
                  <EmpBubbleCounter value={String(columnIds.length)} title="Colunas selecionadas" className="emp-toolbar-bubble-counter" />
                </div>
              </div>
            }
          >
          <EmpToolbarInfoBar badgeLabel={badge} title={titulo} operationLabel="Configuração" className="!border-b-[0.5px]" />

          <div className="px-2 py-1">
            <label className="flex h-6 items-center gap-2 text-xs font-semibold text-[#1a1f26]">
              <ToggleSwitch className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" checked={useConfiguredColumns} onChange={handleUseConfiguredColumnsChange} />
              <span className="truncate">Sempre exportar as colunas selecionadas abaixo</span>
            </label>
          </div>

          <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
            <Card className={EMP_CONFIG_DIALOG_TABLE_SHELL}>
              <CardContent className="p-0">
                <div className="max-h-[360px] overflow-auto">
                  <Table className="emp-table-pro w-full border-separate border-spacing-0 table-fixed select-none">
                    <TableHeader>
                      <TableRow className="hover:bg-transparent">
                        <TableHead className="emp-th h-[26px] w-[72px] border-r-[0.5px] border-b-[0.5px] border-[#c5ced8] bg-white px-1 text-center text-xs font-semibold text-[#1a1f26]">
                          Exportar
                        </TableHead>
                        <TableHead className="emp-th h-[26px] border-b-[0.5px] border-[#c5ced8] bg-white px-1 text-left text-xs font-semibold text-[#1a1f26]">
                          Coluna
                        </TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {columns.map((col, index) => {
                        const selected = columnIds.includes(col.id);
                        const rowClass = selected ? "emp-row-selected" : index % 2 === 0 ? "emp-row-even" : "emp-row-odd";
                        return (
                          <TableRow key={col.id} className={`${rowClass} cursor-pointer transition-colors hover:brightness-[0.98]`} onClick={() => toggleColumn(col.id)}>
                            <TableCell className={`emp-td h-[26px] border-r-[0.5px] border-b-[0.5px] border-[#c5ced8] px-1 py-0 text-center align-middle ${rowClass}`}>
                              <span onClick={(event) => event.stopPropagation()}>
                              <ToggleSwitch className="emp-form-toggle-switch" checkedClassName="emp-form-toggle-switch-on" checked={selected} onChange={() => toggleColumn(col.id)} />
                              </span>
                            </TableCell>
                            <TableCell className={`emp-td h-[26px] border-b-[0.5px] border-[#c5ced8] px-1 py-0 align-middle text-xs ${rowClass}`}>
                              <span className={`block truncate ${selected ? "font-semibold text-[#1a1f26]" : "text-[#5b6b80]"}`}>{col.label}</span>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </div>
          </EmpSplitToolbarLayout>
        </div>
      </DialogContent>
    </Dialog>
  );
}
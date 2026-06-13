import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { showWarning } from "@/shared/feedback";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsLeft, ChevronsRight, Columns3, RotateCcw, Search, X } from "lucide-react";
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

const moveButtonClass = "emp-toolbar-btn h-[24px] w-[24px] rounded-[5px] border-0 bg-[#eaf2ff] text-[#334155] hover:bg-[#dde9fb] shadow-none disabled:opacity-40";

export default function EmpConfiguracaoColunasDialog({
  open,
  onOpenChange,
  moduleTitle = "Cadastro",
  colunasDisponiveis = [],
  colunasVisiveis = [],
  colunasOrdem = [],
  frozenColumnCount = 0,
  onChange,
  onResetDefault
}) {
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedUsedIds, setSelectedUsedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [searchUsed, setSearchUsed] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const orderedColumns = useMemo(() => {
    const byId = new Map(colunasDisponiveis.filter((c) => !c.fixo).map((col) => [col.id, col]));
    const orderedIds = [...colunasOrdem, ...colunasDisponiveis.map((col) => col.id)].filter((id, index, arr) => byId.has(id) && arr.indexOf(id) === index);
    return orderedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [colunasDisponiveis, colunasOrdem]);

  const usedColumns = orderedColumns.filter((col) => colunasVisiveis.includes(col.id));
  const availableColumns = orderedColumns.filter((col) => !colunasVisiveis.includes(col.id));
  const filteredAvailable = availableColumns.filter((col) => String(col.label || "").toLowerCase().includes(search.toLowerCase()));
  const filteredUsed = usedColumns.filter((col) => String(col.label || "").toLowerCase().includes(searchUsed.toLowerCase()));

  const commitLayout = (nextVisible, nextUsedOrder, nextFrozenCount = frozenColumnCount) => {
    const remainingIds = orderedColumns.map((col) => col.id).filter((id) => !nextUsedOrder.includes(id));
    onChange?.({ visiveis: nextVisible, ordem: [...nextUsedOrder, ...remainingIds], frozenColumnCount: Math.min(nextFrozenCount, nextUsedOrder.length) });
  };

  const selectAvailable = (colId, event) => { setSelectedAvailableIds((prev) => event.ctrlKey || event.metaKey || event.shiftKey ? prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId] : [colId]); setSelectedUsedIds([]); };
  const selectUsed = (colId, event) => { setSelectedUsedIds((prev) => event.ctrlKey || event.metaKey || event.shiftKey ? prev.includes(colId) ? prev.filter((id) => id !== colId) : [...prev, colId] : [colId]); setSelectedAvailableIds([]); };

  const addColumns = (ids) => { if (!ids.length) return; const nextVisible = Array.from(new Set([...colunasVisiveis, ...ids])); const nextUsedOrder = [...usedColumns.map((c) => c.id), ...ids.filter((id) => !colunasVisiveis.includes(id))]; commitLayout(nextVisible, nextUsedOrder); };
  const removeColumns = (ids) => { if (!ids.length) return; const nextVisible = colunasVisiveis.filter((id) => !ids.includes(id)); const nextUsedOrder = usedColumns.map((c) => c.id).filter((id) => !ids.includes(id)); commitLayout(nextVisible, nextUsedOrder); };

  const addSelected = () => { addColumns(selectedAvailableIds); setSelectedAvailableIds([]); };
  const addAll = () => { const allIds = orderedColumns.map((c) => c.id); commitLayout(allIds, allIds); setSelectedAvailableIds([]); };
  const removeSelected = () => { removeColumns(selectedUsedIds); setSelectedUsedIds([]); };
  const removeAll = () => { commitLayout([], []); setSelectedUsedIds([]); };

  const moveSelected = (direction) => {
    if (selectedUsedIds.length !== 1) return;
    const currentOrder = usedColumns.map((c) => c.id);
    const index = currentOrder.indexOf(selectedUsedIds[0]);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) return;
    [currentOrder[index], currentOrder[nextIndex]] = [currentOrder[nextIndex], currentOrder[index]];
    commitLayout(currentOrder, currentOrder);
  };

  const startDrag = (colId, origem) => { setDraggedColumnId(colId); setDraggedFrom(origem); if (origem === "available") { setSelectedAvailableIds((p) => p.includes(colId) ? p : [colId]); setSelectedUsedIds([]); } else { setSelectedUsedIds((p) => p.includes(colId) ? p : [colId]); setSelectedAvailableIds([]); } };
  const finishDrag = () => { setDraggedColumnId(null); setDraggedFrom(null); };
  const dropToAvailable = () => { if (draggedFrom !== "used") return finishDrag(); const ids = selectedUsedIds.includes(draggedColumnId) ? selectedUsedIds : [draggedColumnId]; removeColumns(ids.filter(Boolean)); setSelectedUsedIds([]); finishDrag(); };
  const dropToUsed = () => { if (draggedFrom !== "available") return finishDrag(); const ids = selectedAvailableIds.includes(draggedColumnId) ? selectedAvailableIds : [draggedColumnId]; addColumns(ids.filter(Boolean)); setSelectedAvailableIds([]); finishDrag(); };
  const reorderUsedByDrop = (targetId) => { if (draggedFrom !== "used" || !draggedColumnId || draggedColumnId === targetId) return; const currentOrder = usedColumns.map((c) => c.id); const from = currentOrder.indexOf(draggedColumnId); const to = currentOrder.indexOf(targetId); if (from < 0 || to < 0) return; const [moved] = currentOrder.splice(from, 1); currentOrder.splice(to, 0, moved); commitLayout(currentOrder, currentOrder); };
  const requestClose = () => {
    if (usedColumns.length === 0) {
      showWarning("É necessário manter pelo menos uma coluna em uso para fechar a configuração.");
      return;
    }
    onOpenChange(false);
  };
  const toggleFreezeColumn = (index, event) => { event.stopPropagation(); if (index === frozenColumnCount) { commitLayout(colunasVisiveis, usedColumns.map((c) => c.id), frozenColumnCount + 1); } if (index === frozenColumnCount - 1) { commitLayout(colunasVisiveis, usedColumns.map((c) => c.id), frozenColumnCount - 1); } };

  const renderColumnButton = ({ col, selected, onClick, subtitle, index, origem }) =>
    <button key={col.id} type="button" draggable onClick={onClick} onDragStart={() => startDrag(col.id, origem)} onDragOver={(e) => { e.preventDefault(); if (origem === "used") reorderUsedByDrop(col.id); }} onDrop={finishDrag} onDragEnd={finishDrag}
      className={`emp-config-columns-border-b relative flex h-[26px] w-full items-center gap-2 px-1 text-left text-xs last:border-b-0 transition-colors hover:brightness-[0.98] ${selected ? "emp-row-selected font-semibold text-[#1a1f26]" : "bg-white text-[#5b6b80]"} ${draggedColumnId === col.id ? "opacity-50" : ""}`}>
      {index !== undefined && <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-[10px] text-slate-600">{index + 1}</span>}
      {index !== undefined && <button type="button" title={index < frozenColumnCount ? "Coluna congelada" : index === frozenColumnCount ? "Congelar coluna" : "Congele as colunas anteriores primeiro"} onClick={(e) => toggleFreezeColumn(index, e)} disabled={index > frozenColumnCount} className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"><Columns3 className={`w-3.5 h-3.5 transition-colors ${index < frozenColumnCount ? "text-emerald-500" : index === frozenColumnCount ? "text-slate-400" : "text-slate-300"}`} /></button>}
      <span className="min-w-0 flex-1 truncate">{col.label}</span>
      <span className="shrink-0 text-[10px] text-slate-400">{subtitle}</span>
    </button>;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen && onOpenChange(nextOpen)}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className={`${EMP_CONFIG_DIALOG_CONTENT} emp-config-columns-dialog max-w-[900px]`}>
        <DialogTitle className="sr-only">Configuração das colunas - Empresas</DialogTitle>

        <div className={EMP_CONFIG_DIALOG_SHELL}>
          <div className={EMP_CONFIG_DIALOG_CLOSE_ROW}>
            <button type="button" onClick={requestClose} className={EMP_CONFIG_DIALOG_CLOSE_BUTTON} title="Fechar" aria-label="Fechar">
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>

          <EmpSplitToolbarLayout
            toolbar={
              <div className={EMP_CONFIG_DIALOG_TOOLBAR}>
                <ToolbarBtn onClick={onResetDefault} className={EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN} title="Restaurar padrão">
                  <EmpToolbarIcon icon={RotateCcw} />
                  <span>Restaurar padrão</span>
                </ToolbarBtn>
                <div className="ml-auto flex items-center gap-1 pr-1">
                  <EmpBubbleCounter value={String(usedColumns.length)} title="Colunas em uso" className="emp-toolbar-bubble-counter" />
                </div>
              </div>
            }
          >
          <EmpToolbarInfoBar badgeLabel="Colunas" title={`Configuração das colunas - ${moduleTitle}`} operationLabel="Configuração" className="!border-b-[0.5px]" />

          <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
            <Card className={EMP_CONFIG_DIALOG_TABLE_SHELL}>
              <CardContent className="p-0">
                <div className="grid grid-cols-[1fr_44px_1.15fr_36px] h-[430px] min-h-0">
                  <aside className="overflow-hidden flex flex-col" onDragOver={(e) => e.preventDefault()} onDrop={dropToAvailable}>
                    <div className="emp-config-columns-border-b h-[26px] px-1 flex items-center text-xs font-semibold text-[#1a1f26]">Colunas disponíveis</div>
                    <div className="emp-config-columns-border-b relative p-1">
                      <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar coluna" className="h-6 rounded-[5px] border-[#dce3eb] px-1 pr-7 text-xs shadow-none focus-visible:ring-0" />
                      <Search className="w-3.5 h-3.5 text-[#5b6b80] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="erp-scroll-compact-y min-h-0 flex-1 overflow-y-auto">
                      {filteredAvailable.length === 0 ? <div className="text-xs text-[#5b6b80] py-6 text-center">Nenhuma coluna disponível.</div> : filteredAvailable.map((col) => renderColumnButton({ col, selected: selectedAvailableIds.includes(col.id), onClick: (e) => selectAvailable(col.id, e), subtitle: "Disponível", origem: "available" }))}
                    </div>
                  </aside>
                  <section className="emp-config-columns-border-x bg-white flex flex-col items-center justify-center gap-1">
                    <Button type="button" variant="outline" size="icon" disabled={usedColumns.length === 0} onClick={removeAll} className={moveButtonClass} title="Remover todas"><ChevronsLeft className="w-3.5 h-3.5" /></Button>
                    <Button type="button" variant="outline" size="icon" disabled={selectedUsedIds.length === 0} onClick={removeSelected} className={moveButtonClass} title="Remover selecionadas"><ChevronLeft className="w-3.5 h-3.5" /></Button>
                    <Button type="button" variant="outline" size="icon" disabled={selectedAvailableIds.length === 0} onClick={addSelected} className={moveButtonClass} title="Adicionar selecionadas"><ChevronRight className="w-3.5 h-3.5" /></Button>
                    <Button type="button" variant="outline" size="icon" disabled={availableColumns.length === 0} onClick={addAll} className={moveButtonClass} title="Adicionar todas"><ChevronsRight className="w-3.5 h-3.5" /></Button>
                  </section>
                  <main className="overflow-hidden flex flex-col" onDragOver={(e) => e.preventDefault()} onDrop={dropToUsed}>
                    <div className="emp-config-columns-border-b h-[26px] px-1 flex items-center justify-between text-xs font-semibold text-[#1a1f26]">
                      <span>Colunas em uso</span>
                      <span className="font-normal text-[#5b6b80]">{usedColumns.length} colunas</span>
                    </div>
                    <div className="emp-config-columns-border-b relative p-1">
                      <Input value={searchUsed} onChange={(e) => setSearchUsed(e.target.value)} placeholder="Procurar coluna em uso" className="h-6 rounded-[5px] border-[#dce3eb] px-1 pr-7 text-xs shadow-none focus-visible:ring-0" />
                      <Search className="w-3.5 h-3.5 text-[#5b6b80] absolute right-3 top-1/2 -translate-y-1/2" />
                    </div>
                    <div className="erp-scroll-compact-y min-h-0 flex-1 overflow-y-auto">
                      {filteredUsed.length === 0 ? <div className="text-xs text-[#5b6b80] py-6 text-center">Nenhuma coluna em uso encontrada.</div> : filteredUsed.map((col) => { const originalIndex = usedColumns.findIndex((c) => c.id === col.id); return renderColumnButton({ col, selected: selectedUsedIds.includes(col.id), onClick: (e) => selectUsed(col.id, e), subtitle: "Em uso", index: originalIndex, origem: "used" }); })}
                    </div>
                  </main>
                  <section className="emp-config-columns-border-l bg-white flex flex-col items-center justify-center gap-1">
                    <Button type="button" variant="outline" size="icon" disabled={selectedUsedIds.length !== 1} onClick={() => moveSelected(-1)} className={moveButtonClass} title="Subir coluna"><ChevronUp className="w-3.5 h-3.5" /></Button>
                    <Button type="button" variant="outline" size="icon" disabled={selectedUsedIds.length !== 1} onClick={() => moveSelected(1)} className={moveButtonClass} title="Descer coluna"><ChevronDown className="w-3.5 h-3.5" /></Button>
                  </section>
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
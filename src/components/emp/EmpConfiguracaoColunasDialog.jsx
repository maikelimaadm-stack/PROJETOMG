import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import TopNoticeDialog from "@/components/common/TopNoticeDialog";
import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp, ChevronsLeft, ChevronsRight, Columns3, RotateCcw, Search, X } from "lucide-react";

const iconButtonClass = "rounded-none border-0 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-600 shadow-none h-7 w-7";
const moveButtonClass = "h-7 w-7 rounded-none border-0 bg-white hover:bg-slate-50 text-slate-500 hover:text-slate-600 shadow-none disabled:opacity-40";

export default function EmpConfiguracaoColunasDialog({
  open,
  onOpenChange,
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
  const [warningOpen, setWarningOpen] = useState(false);

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
  const requestClose = () => { if (usedColumns.length === 0) { setWarningOpen(true); return; } onOpenChange(false); };
  const toggleFreezeColumn = (index, event) => { event.stopPropagation(); if (index === frozenColumnCount) { commitLayout(colunasVisiveis, usedColumns.map((c) => c.id), frozenColumnCount + 1); } if (index === frozenColumnCount - 1) { commitLayout(colunasVisiveis, usedColumns.map((c) => c.id), frozenColumnCount - 1); } };

  const renderColumnButton = ({ col, selected, onClick, subtitle, index, origem }) =>
    <button key={col.id} type="button" draggable onClick={onClick} onDragStart={() => startDrag(col.id, origem)} onDragOver={(e) => { e.preventDefault(); if (origem === "used") reorderUsedByDrop(col.id); }} onDrop={finishDrag} onDragEnd={finishDrag}
      className={`relative flex w-full items-center gap-2 border-b border-slate-200 px-3 py-2 text-left text-xs last:border-b-0 hover:bg-slate-50 ${selected ? "bg-white text-slate-500" : "bg-white text-slate-500"} ${draggedColumnId === col.id ? "opacity-50" : ""}`}>
      {index !== undefined && <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-[10px] text-slate-600">{index + 1}</span>}
      {index !== undefined && <button type="button" title={index < frozenColumnCount ? "Coluna congelada" : index === frozenColumnCount ? "Congelar coluna" : "Congele as colunas anteriores primeiro"} onClick={(e) => toggleFreezeColumn(index, e)} disabled={index > frozenColumnCount} className="flex h-5 w-5 shrink-0 items-center justify-center text-slate-400 hover:text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"><Columns3 className={`w-3.5 h-3.5 transition-colors ${index < frozenColumnCount ? "text-emerald-500" : index === frozenColumnCount ? "text-slate-400" : "text-slate-300"}`} /></button>}
      <span className="min-w-0 flex-1 truncate">{col.label}</span>
      <span className="shrink-0 text-[10px] text-slate-400">{subtitle}</span>
    </button>;

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen && onOpenChange(nextOpen)}>
      <DialogContent onInteractOutside={(e) => e.preventDefault()} onEscapeKeyDown={(e) => e.preventDefault()} className="bg-transparent fixed left-[50%] top-[50%] z-50 grid w-[calc(100%-1rem)] max-h-[90vh] translate-x-[-50%] translate-y-[-50%] gap-0 overflow-hidden border-0 shadow-lg sm:w-full rounded-none sm:rounded-none sm:p-0 max-w-[900px]">
        <DialogTitle className="sr-only">Configuração das colunas - Empresas</DialogTitle>
        <div className="bg-white overflow-hidden cadastro-emp-scope">
          <div className="h-8 flex items-center gap-2 border-b border-slate-200 px-2">
            <span className="w-[90px] h-5 px-1.5 rounded-none border-[0.5px] border-slate-300 bg-white text-slate-500 text-[11px] font-bold text-center truncate inline-flex items-center justify-center">Colunas</span>
            <span className="text-xs font-semibold text-slate-500 truncate flex-1">Configuração das colunas - Cadastro de Empresas</span>
            <Button type="button" onClick={onResetDefault} title="Restaurar padrão" className={iconButtonClass}><RotateCcw className="w-4 h-4" /></Button>
            <Button type="button" onClick={requestClose} title="Fechar" className={iconButtonClass}><X className="w-4 h-4" /></Button>
          </div>
          <div className="grid grid-cols-[1fr_44px_1.15fr_36px] h-[430px] min-h-0">
            <aside className="overflow-hidden flex flex-col" onDragOver={(e) => e.preventDefault()} onDrop={dropToAvailable}>
              <div className="h-8 px-3 border-b border-slate-200 flex items-center text-xs font-semibold text-slate-500">Colunas disponíveis</div>
              <div className="relative p-2 border-b border-slate-200">
                <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Procurar coluna" className="h-7 text-xs pr-8 rounded-none border-slate-200 shadow-none focus-visible:ring-0" />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-4 top-3.5" />
              </div>
              <div className="flex-1 overflow-auto">
                {filteredAvailable.length === 0 ? <div className="text-xs text-slate-400 py-6 text-center">Nenhuma coluna disponível.</div> : filteredAvailable.map((col) => renderColumnButton({ col, selected: selectedAvailableIds.includes(col.id), onClick: (e) => selectAvailable(col.id, e), subtitle: "Disponível", origem: "available" }))}
              </div>
            </aside>
            <section className="bg-slate-50 flex flex-col items-center justify-center gap-0">
              <Button type="button" variant="outline" size="icon" disabled={usedColumns.length === 0} onClick={removeAll} className={moveButtonClass} title="Remover todas"><ChevronsLeft className="w-3.5 h-3.5" /></Button>
              <Button type="button" variant="outline" size="icon" disabled={selectedUsedIds.length === 0} onClick={removeSelected} className={moveButtonClass} title="Remover selecionadas"><ChevronLeft className="w-3.5 h-3.5" /></Button>
              <Button type="button" variant="outline" size="icon" disabled={selectedAvailableIds.length === 0} onClick={addSelected} className={moveButtonClass} title="Adicionar selecionadas"><ChevronRight className="w-3.5 h-3.5" /></Button>
              <Button type="button" variant="outline" size="icon" disabled={availableColumns.length === 0} onClick={addAll} className={moveButtonClass} title="Adicionar todas"><ChevronsRight className="w-3.5 h-3.5" /></Button>
            </section>
            <main className="overflow-hidden flex flex-col border-r border-slate-200" onDragOver={(e) => e.preventDefault()} onDrop={dropToUsed}>
              <div className="h-8 px-3 border-b border-slate-200 flex items-center justify-between text-xs font-semibold text-slate-500">
                <span>Colunas em uso</span>
                <span className="font-normal text-slate-400">{usedColumns.length} colunas</span>
              </div>
              <div className="relative p-2 border-b border-slate-200">
                <Input value={searchUsed} onChange={(e) => setSearchUsed(e.target.value)} placeholder="Procurar coluna em uso" className="h-7 text-xs pr-8 rounded-none border-slate-200 shadow-none focus-visible:ring-0" />
                <Search className="w-3.5 h-3.5 text-slate-500 absolute right-4 top-3.5" />
              </div>
              <div className="flex-1 overflow-auto">
                {filteredUsed.length === 0 ? <div className="text-xs text-slate-400 py-6 text-center">Nenhuma coluna em uso encontrada.</div> : filteredUsed.map((col) => { const originalIndex = usedColumns.findIndex((c) => c.id === col.id); return renderColumnButton({ col, selected: selectedUsedIds.includes(col.id), onClick: (e) => selectUsed(col.id, e), subtitle: "Em uso", index: originalIndex, origem: "used" }); })}
              </div>
            </main>
            <section className="bg-slate-50 flex flex-col items-center justify-center gap-0">
              <Button type="button" variant="outline" size="icon" disabled={selectedUsedIds.length !== 1} onClick={() => moveSelected(-1)} className={moveButtonClass} title="Subir coluna"><ChevronUp className="w-3.5 h-3.5" /></Button>
              <Button type="button" variant="outline" size="icon" disabled={selectedUsedIds.length !== 1} onClick={() => moveSelected(1)} className={moveButtonClass} title="Descer coluna"><ChevronDown className="w-3.5 h-3.5" /></Button>
            </section>
          </div>
        </div>
        <TopNoticeDialog open={warningOpen} onOpenChange={setWarningOpen} badge="AVISO" title="Colunas obrigatórias" description="É necessário manter pelo menos uma coluna em uso para fechar a configuração." type="warning" confirmText="Entendi" />
      </DialogContent>
    </Dialog>
  );
}
import React, { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { GripVertical } from "lucide-react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ConfiguracaoColunasEmpresaDialog({ open, onOpenChange, colunasDisponiveis = [], colunasVisiveis = [], colunasOrdem = [], frozenColumnCount = 0, onChange, onResetDefault }) {
  const [localVisiveis, setLocalVisiveis] = useState(colunasVisiveis);
  const [localOrdem, setLocalOrdem] = useState(colunasOrdem);
  const [localFrozen, setLocalFrozen] = useState(frozenColumnCount);

  React.useEffect(() => {
    if (open) { setLocalVisiveis(colunasVisiveis); setLocalOrdem(colunasOrdem); setLocalFrozen(frozenColumnCount); }
  }, [open, colunasVisiveis, colunasOrdem, frozenColumnCount]);

  const ordered = localOrdem.map(id => colunasDisponiveis.find(c => c.id === id)).filter(Boolean);
  const rest = colunasDisponiveis.filter(c => !localOrdem.includes(c.id));
  const all = [...ordered, ...rest];

  const handleDragEnd = result => {
    if (!result.destination) return;
    const items = Array.from(all.map(c => c.id));
    const [moved] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, moved);
    setLocalOrdem(items);
  };

  const handleApply = () => { onChange({ visiveis: localVisiveis, ordem: localOrdem, frozenColumnCount: localFrozen }); onOpenChange(false); };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg rounded-none">
        <DialogHeader><DialogTitle className="text-sm font-semibold">Configurar Colunas</DialogTitle></DialogHeader>
        <div className="text-xs text-slate-500 mb-2">Arraste para reordenar. Marque para exibir.</div>
        <div className="max-h-[60vh] overflow-y-auto border border-slate-200">
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId="colunas">
              {provided => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {all.map((col, index) => (
                    <Draggable key={col.id} draggableId={col.id} index={index}>
                      {prov => (
                        <div ref={prov.innerRef} {...prov.draggableProps} className="flex items-center gap-2 h-8 px-2 border-b border-slate-100 bg-white hover:bg-slate-50">
                          <div {...prov.dragHandleProps}><GripVertical className="w-3.5 h-3.5 text-slate-400" /></div>
                          <Checkbox checked={localVisiveis.includes(col.id)} onCheckedChange={checked => setLocalVisiveis(prev => checked ? [...prev, col.id] : prev.filter(id => id !== col.id))} className="h-3.5 w-3.5" />
                          <span className="text-xs text-slate-700 truncate flex-1">{col.label}</span>
                          {index < localFrozen && <span className="text-[10px] text-emerald-700 font-semibold">Fixo</span>}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </div>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xs text-slate-600">Colunas fixas:</span>
          <input type="number" min={0} max={localVisiveis.length} value={localFrozen} onChange={e => setLocalFrozen(Math.max(0, Number(e.target.value)))} className="w-14 h-7 text-xs border border-slate-300 px-1 rounded-none text-center" />
        </div>
        <div className="flex justify-end gap-2 mt-3">
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-none" onClick={onResetDefault}>Padrão</Button>
          <Button type="button" variant="outline" size="sm" className="h-7 text-xs rounded-none" onClick={() => onOpenChange(false)}>Cancelar</Button>
          <Button type="button" size="sm" className="h-7 text-xs rounded-none bg-emerald-600 hover:bg-emerald-700 text-white" onClick={handleApply}>Aplicar</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
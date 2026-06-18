import React, { useMemo, useState } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/shared/ui/dialog";
import { Button } from "@/shared/ui/button";
import { Card, CardContent } from "@/shared/ui/card";
import { Input } from "@/shared/ui/input";
import { showWarning } from "@/shared/feedback";
import {
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  ChevronsLeft,
  ChevronsRight,
  RotateCcw,
  Search,
  X,
} from "lucide-react";
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

const moveButtonClass =
  "emp-toolbar-btn h-[24px] w-[24px] rounded-[5px] border-0 bg-[#eaf2ff] text-[#334155] hover:bg-[#dde9fb] shadow-none disabled:opacity-40";

export default function EmpConfiguracaoFiltrosDialog({
  open,
  onOpenChange,
  moduleTitle = "Cadastro",
  camposDisponiveis = [],
  camposVisiveis = [],
  camposOrdem = [],
  onChange,
  onResetDefault,
}) {
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedUsedIds, setSelectedUsedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [searchUsed, setSearchUsed] = useState("");
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const orderedFields = useMemo(() => {
    const byId = new Map(camposDisponiveis.map((field) => [field.id, field]));
    const orderedIds = [
      ...camposOrdem,
      ...camposDisponiveis.map((field) => field.id),
    ].filter((id, index, arr) => byId.has(id) && arr.indexOf(id) === index);
    return orderedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [camposDisponiveis, camposOrdem]);

  const usedFields = orderedFields.filter((field) => camposVisiveis.includes(field.id));
  const availableFields = orderedFields.filter((field) => !camposVisiveis.includes(field.id));
  const filteredAvailable = availableFields.filter((field) =>
    String(field.label || "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsed = usedFields.filter((field) =>
    String(field.label || "").toLowerCase().includes(searchUsed.toLowerCase())
  );

  const commitLayout = (nextVisible, nextUsedOrder) => {
    const remainingIds = orderedFields
      .map((field) => field.id)
      .filter((id) => !nextUsedOrder.includes(id));
    onChange?.({
      visiveis: nextVisible,
      ordem: [...nextUsedOrder, ...remainingIds],
    });
  };

  const selectAvailable = (fieldId, event) => {
    setSelectedAvailableIds((prev) =>
      event.ctrlKey || event.metaKey || event.shiftKey
        ? prev.includes(fieldId)
          ? prev.filter((id) => id !== fieldId)
          : [...prev, fieldId]
        : [fieldId]
    );
    setSelectedUsedIds([]);
  };

  const selectUsed = (fieldId, event) => {
    setSelectedUsedIds((prev) =>
      event.ctrlKey || event.metaKey || event.shiftKey
        ? prev.includes(fieldId)
          ? prev.filter((id) => id !== fieldId)
          : [...prev, fieldId]
        : [fieldId]
    );
    setSelectedAvailableIds([]);
  };

  const addFields = (ids) => {
    if (!ids.length) return;
    const nextVisible = Array.from(new Set([...camposVisiveis, ...ids]));
    const nextUsedOrder = [
      ...usedFields.map((field) => field.id),
      ...ids.filter((id) => !camposVisiveis.includes(id)),
    ];
    commitLayout(nextVisible, nextUsedOrder);
  };

  const removeFields = (ids) => {
    if (!ids.length) return;
    const nextVisible = camposVisiveis.filter((id) => !ids.includes(id));
    const nextUsedOrder = usedFields
      .map((field) => field.id)
      .filter((id) => !ids.includes(id));
    commitLayout(nextVisible, nextUsedOrder);
  };

  const addSelected = () => {
    addFields(selectedAvailableIds);
    setSelectedAvailableIds([]);
  };

  const addAll = () => {
    const allIds = orderedFields.map((field) => field.id);
    commitLayout(allIds, allIds);
    setSelectedAvailableIds([]);
  };

  const removeSelected = () => {
    removeFields(selectedUsedIds);
    setSelectedUsedIds([]);
  };

  const removeAll = () => {
    commitLayout([], []);
    setSelectedUsedIds([]);
  };

  const moveSelected = (direction) => {
    if (selectedUsedIds.length !== 1) return;
    const currentOrder = usedFields.map((field) => field.id);
    const index = currentOrder.indexOf(selectedUsedIds[0]);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) return;
    [currentOrder[index], currentOrder[nextIndex]] = [
      currentOrder[nextIndex],
      currentOrder[index],
    ];
    commitLayout(currentOrder, currentOrder);
  };

  const startDrag = (fieldId, origem) => {
    setDraggedFieldId(fieldId);
    setDraggedFrom(origem);
    if (origem === "available") {
      setSelectedAvailableIds((prev) => (prev.includes(fieldId) ? prev : [fieldId]));
      setSelectedUsedIds([]);
    } else {
      setSelectedUsedIds((prev) => (prev.includes(fieldId) ? prev : [fieldId]));
      setSelectedAvailableIds([]);
    }
  };

  const finishDrag = () => {
    setDraggedFieldId(null);
    setDraggedFrom(null);
  };

  const dropToAvailable = () => {
    if (draggedFrom !== "used") return finishDrag();
    const ids = selectedUsedIds.includes(draggedFieldId)
      ? selectedUsedIds
      : [draggedFieldId];
    removeFields(ids.filter(Boolean));
    setSelectedUsedIds([]);
    finishDrag();
  };

  const dropToUsed = () => {
    if (draggedFrom !== "available") return finishDrag();
    const ids = selectedAvailableIds.includes(draggedFieldId)
      ? selectedAvailableIds
      : [draggedFieldId];
    addFields(ids.filter(Boolean));
    setSelectedAvailableIds([]);
    finishDrag();
  };

  const reorderUsedByDrop = (targetId) => {
    if (draggedFrom !== "used" || !draggedFieldId || draggedFieldId === targetId) return;
    const currentOrder = usedFields.map((field) => field.id);
    const from = currentOrder.indexOf(draggedFieldId);
    const to = currentOrder.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [moved] = currentOrder.splice(from, 1);
    currentOrder.splice(to, 0, moved);
    commitLayout(currentOrder, currentOrder);
  };

  const requestClose = () => {
    if (usedFields.length === 0) {
      showWarning("É necessário manter pelo menos um filtro em uso para fechar a configuração.");
      return;
    }
    onOpenChange(false);
  };

  const renderFieldButton = ({ field, selected, onClick, subtitle, index, origem }) => (
    <button
      key={field.id}
      type="button"
      draggable
      onClick={onClick}
      onDragStart={() => startDrag(field.id, origem)}
      onDragOver={(event) => {
        event.preventDefault();
        if (origem === "used") reorderUsedByDrop(field.id);
      }}
      onDrop={finishDrag}
      onDragEnd={finishDrag}
      className={`emp-config-columns-border-b relative flex h-[26px] w-full items-center gap-2 px-1 text-left text-xs last:border-b-0 transition-colors hover:brightness-[0.98] ${
        selected ? "emp-row-selected font-semibold text-[#1a1f26]" : "bg-white text-[#5b6b80]"
      } ${draggedFieldId === field.id ? "opacity-50" : ""}`}
    >
      {index !== undefined ? (
        <span className="flex h-5 w-6 shrink-0 items-center justify-center rounded-sm bg-slate-100 text-[10px] text-slate-600">
          {index + 1}
        </span>
      ) : null}
      <span className="min-w-0 flex-1 truncate">{field.label}</span>
      <span className="shrink-0 text-[10px] text-slate-400">{subtitle}</span>
    </button>
  );

  return (
    <Dialog open={open} onOpenChange={(nextOpen) => nextOpen && onOpenChange(nextOpen)}>
      <DialogContent
        onInteractOutside={(event) => event.preventDefault()}
        onEscapeKeyDown={(event) => event.preventDefault()}
        className={`${EMP_CONFIG_DIALOG_CONTENT} emp-config-columns-dialog max-w-[900px]`}
      >
        <DialogTitle className="sr-only">Configuração dos filtros - Empresas</DialogTitle>

        <div className={EMP_CONFIG_DIALOG_SHELL}>
          <div className={EMP_CONFIG_DIALOG_CLOSE_ROW}>
            <button
              type="button"
              onClick={requestClose}
              className={EMP_CONFIG_DIALOG_CLOSE_BUTTON}
              title="Fechar"
              aria-label="Fechar"
            >
              <X className="h-3.5 w-3.5" strokeWidth={2.25} />
            </button>
          </div>

          <EmpSplitToolbarLayout
            toolbar={
              <div className={EMP_CONFIG_DIALOG_TOOLBAR}>
                <ToolbarBtn
                  onClick={onResetDefault}
                  className={EMP_CONFIG_DIALOG_TOOLBAR_LABELED_BTN}
                  title="Restaurar padrão"
                >
                  <EmpToolbarIcon icon={RotateCcw} />
                  <span>Restaurar padrão</span>
                </ToolbarBtn>
                <div className="ml-auto flex items-center gap-1 pr-1">
                  <EmpBubbleCounter
                    value={String(usedFields.length)}
                    title="Filtros em uso"
                    className="emp-toolbar-bubble-counter"
                  />
                </div>
              </div>
            }
          >
            <EmpToolbarInfoBar
              badgeLabel="Filtros"
              title={`Configuração dos filtros - ${moduleTitle}`}
              operationLabel="Configuração"
              className="!border-b-[0.5px]"
            />

            <div className={EMP_CONFIG_DIALOG_TABLE_WRAP}>
              <Card className={EMP_CONFIG_DIALOG_TABLE_SHELL}>
                <CardContent className="p-0">
                  <div className="grid grid-cols-[1fr_44px_1.15fr_36px] h-[430px] min-h-0">
                    <aside
                      className="overflow-hidden flex flex-col"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={dropToAvailable}
                    >
                      <div className="emp-config-columns-border-b h-[26px] px-1 flex items-center text-xs font-semibold text-[#1a1f26]">
                        Campos disponíveis
                      </div>
                      <div className="emp-config-columns-border-b relative p-1">
                        <Input
                          value={search}
                          onChange={(event) => setSearch(event.target.value)}
                          placeholder="Procurar campo"
                          className="h-6 rounded-[5px] border-[#dce3eb] px-1 pr-7 text-xs shadow-none focus-visible:ring-0"
                        />
                        <Search className="w-3.5 h-3.5 text-[#5b6b80] absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <div className="flex-1 overflow-auto">
                        {filteredAvailable.length === 0 ? (
                          <div className="text-xs text-[#5b6b80] py-6 text-center">
                            Nenhum campo disponível.
                          </div>
                        ) : (
                          filteredAvailable.map((field) =>
                            renderFieldButton({
                              field,
                              selected: selectedAvailableIds.includes(field.id),
                              onClick: (event) => selectAvailable(field.id, event),
                              subtitle: "Disponível",
                              origem: "available",
                            })
                          )
                        )}
                      </div>
                    </aside>

                    <section className="emp-config-columns-border-x bg-white flex flex-col items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={usedFields.length === 0}
                        onClick={removeAll}
                        className={moveButtonClass}
                        title="Remover todos"
                      >
                        <ChevronsLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={selectedUsedIds.length === 0}
                        onClick={removeSelected}
                        className={moveButtonClass}
                        title="Remover selecionados"
                      >
                        <ChevronLeft className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={selectedAvailableIds.length === 0}
                        onClick={addSelected}
                        className={moveButtonClass}
                        title="Adicionar selecionados"
                      >
                        <ChevronRight className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={availableFields.length === 0}
                        onClick={addAll}
                        className={moveButtonClass}
                        title="Adicionar todos"
                      >
                        <ChevronsRight className="w-3.5 h-3.5" />
                      </Button>
                    </section>

                    <main
                      className="overflow-hidden flex flex-col"
                      onDragOver={(event) => event.preventDefault()}
                      onDrop={dropToUsed}
                    >
                      <div className="emp-config-columns-border-b h-[26px] px-1 flex items-center justify-between text-xs font-semibold text-[#1a1f26]">
                        <span>Campos em uso</span>
                        <span className="font-normal text-[#5b6b80]">{usedFields.length} filtros</span>
                      </div>
                      <div className="emp-config-columns-border-b relative p-1">
                        <Input
                          value={searchUsed}
                          onChange={(event) => setSearchUsed(event.target.value)}
                          placeholder="Procurar campo em uso"
                          className="h-6 rounded-[5px] border-[#dce3eb] px-1 pr-7 text-xs shadow-none focus-visible:ring-0"
                        />
                        <Search className="w-3.5 h-3.5 text-[#5b6b80] absolute right-3 top-1/2 -translate-y-1/2" />
                      </div>
                      <div className="flex-1 overflow-auto">
                        {filteredUsed.length === 0 ? (
                          <div className="text-xs text-[#5b6b80] py-6 text-center">
                            Nenhum campo em uso encontrado.
                          </div>
                        ) : (
                          filteredUsed.map((field) => {
                            const originalIndex = usedFields.findIndex(
                              (item) => item.id === field.id
                            );
                            return renderFieldButton({
                              field,
                              selected: selectedUsedIds.includes(field.id),
                              onClick: (event) => selectUsed(field.id, event),
                              subtitle: "Em uso",
                              index: originalIndex,
                              origem: "used",
                            });
                          })
                        )}
                      </div>
                    </main>

                    <section className="emp-config-columns-border-l bg-white flex flex-col items-center justify-center gap-1">
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={selectedUsedIds.length !== 1}
                        onClick={() => moveSelected(-1)}
                        className={moveButtonClass}
                        title="Subir campo"
                      >
                        <ChevronUp className="w-3.5 h-3.5" />
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="icon"
                        disabled={selectedUsedIds.length !== 1}
                        onClick={() => moveSelected(1)}
                        className={moveButtonClass}
                        title="Descer campo"
                      >
                        <ChevronDown className="w-3.5 h-3.5" />
                      </Button>
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

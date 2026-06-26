import React, { useEffect, useMemo, useRef, useState } from "react";
import { Columns3 } from "lucide-react";
import { showWarning } from "@/shared/feedback";
import {
  EmpConfigDialogFrame,
  EmpConfigPrimaryBtn,
  EmpConfigToolbarBtn,
  EmpConfigTransferPanel,
  EMP_CONFIG_TRANSFER_DIALOG_CLASS,
} from "@/framework/cadastro/configurators/EmpConfigDialogKit";

export default function EmpConfiguracaoColunasDialog({
  open,
  onOpenChange,
  colunasDisponiveis = [],
  colunasVisiveis = [],
  colunasOrdem = [],
  frozenColumnCount = 0,
  onChange,
  getRestoreDefaults,
}) {
  const [draftVisiveis, setDraftVisiveis] = useState([]);
  const [draftOrdem, setDraftOrdem] = useState([]);
  const [draftFrozenColumnCount, setDraftFrozenColumnCount] = useState(0);
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedUsedIds, setSelectedUsedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [searchUsed, setSearchUsed] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);
  const wasOpenRef = useRef(false);
  const committedRef = useRef({
    visiveis: colunasVisiveis,
    ordem: colunasOrdem,
    frozenColumnCount,
  });

  const resetDraftFromCommitted = () => {
    const committed = committedRef.current;
    setDraftVisiveis(committed.visiveis);
    setDraftOrdem(committed.ordem);
    setDraftFrozenColumnCount(committed.frozenColumnCount);
    setSelectedAvailableIds([]);
    setSelectedUsedIds([]);
    setSearch("");
    setSearchUsed("");
    setDraggedColumnId(null);
    setDraggedFrom(null);
  };

  useEffect(() => {
    if (open && !wasOpenRef.current) {
      committedRef.current = {
        visiveis: colunasVisiveis,
        ordem: colunasOrdem,
        frozenColumnCount,
      };
      resetDraftFromCommitted();
    }
    wasOpenRef.current = open;
  }, [open, colunasVisiveis, colunasOrdem, frozenColumnCount]);

  const orderedColumns = useMemo(() => {
    const byId = new Map(colunasDisponiveis.filter((col) => !col.fixo).map((col) => [col.id, col]));
    const orderedIds = [...draftOrdem, ...colunasDisponiveis.map((col) => col.id)].filter(
      (id, index, arr) => byId.has(id) && arr.indexOf(id) === index
    );
    return orderedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [colunasDisponiveis, draftOrdem]);

  const usedColumns = orderedColumns.filter((col) => draftVisiveis.includes(col.id));
  const availableColumns = orderedColumns.filter((col) => !draftVisiveis.includes(col.id));
  const filteredAvailable = availableColumns.filter((col) =>
    String(col.label || "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsed = usedColumns.filter((col) =>
    String(col.label || "").toLowerCase().includes(searchUsed.toLowerCase())
  );

  const syncDraftState = (nextVisible, nextUsedOrder, nextFrozenCount = draftFrozenColumnCount) => {
    const remainingIds = orderedColumns
      .map((col) => col.id)
      .filter((id) => !nextUsedOrder.includes(id));
    const nextOrdem = [...nextUsedOrder, ...remainingIds];
    const normalizedFrozen = Math.min(nextFrozenCount, nextUsedOrder.length);
    setDraftVisiveis(nextVisible);
    setDraftOrdem(nextOrdem);
    setDraftFrozenColumnCount(normalizedFrozen);
  };

  const updateDraftLayout = (nextVisible, nextUsedOrder, nextFrozenCount = draftFrozenColumnCount) => {
    syncDraftState(nextVisible, nextUsedOrder, nextFrozenCount);
  };

  const selectAvailable = (colId, event) => {
    setSelectedAvailableIds((prev) =>
      event.ctrlKey || event.metaKey || event.shiftKey
        ? prev.includes(colId)
          ? prev.filter((id) => id !== colId)
          : [...prev, colId]
        : [colId]
    );
    setSelectedUsedIds([]);
  };

  const selectUsed = (colId, event) => {
    setSelectedUsedIds((prev) =>
      event.ctrlKey || event.metaKey || event.shiftKey
        ? prev.includes(colId)
          ? prev.filter((id) => id !== colId)
          : [...prev, colId]
        : [colId]
    );
    setSelectedAvailableIds([]);
  };

  const addColumns = (ids) => {
    if (!ids.length) return;
    const nextVisible = Array.from(new Set([...draftVisiveis, ...ids]));
    const nextUsedOrder = [
      ...usedColumns.map((col) => col.id),
      ...ids.filter((id) => !draftVisiveis.includes(id)),
    ];
    updateDraftLayout(nextVisible, nextUsedOrder);
  };

  const removeColumns = (ids) => {
    if (!ids.length) return;
    const nextVisible = draftVisiveis.filter((id) => !ids.includes(id));
    const nextUsedOrder = usedColumns.map((col) => col.id).filter((id) => !ids.includes(id));
    if (nextUsedOrder.length === 0) {
      showWarning("É necessário manter pelo menos uma coluna em uso.");
      return;
    }
    updateDraftLayout(nextVisible, nextUsedOrder, Math.min(draftFrozenColumnCount, nextUsedOrder.length));
  };

  const startDrag = (colId, origem) => {
    setDraggedColumnId(colId);
    setDraggedFrom(origem);
    if (origem === "available") {
      setSelectedAvailableIds((prev) => (prev.includes(colId) ? prev : [colId]));
      setSelectedUsedIds([]);
    } else {
      setSelectedUsedIds((prev) => (prev.includes(colId) ? prev : [colId]));
      setSelectedAvailableIds([]);
    }
  };

  const finishDrag = () => {
    setDraggedColumnId(null);
    setDraggedFrom(null);
  };

  const dropToAvailable = () => {
    if (draggedFrom !== "used") return finishDrag();
    const ids = selectedUsedIds.includes(draggedColumnId) ? selectedUsedIds : [draggedColumnId];
    removeColumns(ids.filter(Boolean));
    setSelectedUsedIds([]);
    finishDrag();
  };

  const dropToUsed = () => {
    if (draggedFrom !== "available") return finishDrag();
    const ids = selectedAvailableIds.includes(draggedColumnId)
      ? selectedAvailableIds
      : [draggedColumnId];
    addColumns(ids.filter(Boolean));
    setSelectedAvailableIds([]);
    finishDrag();
  };

  const reorderUsedByDrop = (targetId) => {
    if (draggedFrom !== "used" || !draggedColumnId || draggedColumnId === targetId) return;
    const currentOrder = usedColumns.map((col) => col.id);
    const from = currentOrder.indexOf(draggedColumnId);
    const to = currentOrder.indexOf(targetId);
    if (from < 0 || to < 0) return;
    const [moved] = currentOrder.splice(from, 1);
    currentOrder.splice(to, 0, moved);
    updateDraftLayout(currentOrder, currentOrder);
  };

  const handleRestoreDefault = () => {
    const defaults = getRestoreDefaults?.();
    if (!defaults) return;
    syncDraftState(defaults.visiveis ?? [], defaults.ordem ?? [], defaults.frozenColumnCount ?? 0);
    setSelectedAvailableIds([]);
    setSelectedUsedIds([]);
  };

  const handleOk = () => {
    const nextUsedOrder = usedColumns.map((col) => col.id);
    if (nextUsedOrder.length === 0) {
      showWarning("É necessário manter pelo menos uma coluna em uso.");
      return;
    }
    onChange?.({
      visiveis: draftVisiveis,
      ordem: draftOrdem,
      frozenColumnCount: draftFrozenColumnCount,
    });
    committedRef.current = {
      visiveis: draftVisiveis,
      ordem: draftOrdem,
      frozenColumnCount: draftFrozenColumnCount,
    };
    onOpenChange(false);
  };

  const requestClose = () => {
    resetDraftFromCommitted();
    onOpenChange(false);
  };

  const handleOpenChange = (nextOpen) => {
    if (!nextOpen) {
      requestClose();
      return;
    }
    onOpenChange?.(nextOpen);
  };

  const toggleFreezeColumn = (index, event) => {
    event.stopPropagation();
    const nextFrozen =
      index === draftFrozenColumnCount
        ? draftFrozenColumnCount + 1
        : index === draftFrozenColumnCount - 1
          ? draftFrozenColumnCount - 1
          : draftFrozenColumnCount;
    if (nextFrozen !== draftFrozenColumnCount) {
      syncDraftState(draftVisiveis, usedColumns.map((col) => col.id), nextFrozen);
    }
  };

  return (
    <EmpConfigDialogFrame
      open={open}
      onOpenChange={handleOpenChange}
      onRequestClose={requestClose}
      title="Configuração de colunas"
      infoTitle="Configuração de colunas"
      dialogClassName={EMP_CONFIG_TRANSFER_DIALOG_CLASS}
      onRestoreDefault={getRestoreDefaults ? handleRestoreDefault : null}
      footer={
        <div className="flex w-full justify-end gap-2 px-1">
          <EmpConfigToolbarBtn onClick={requestClose}>Cancelar</EmpConfigToolbarBtn>
          <EmpConfigPrimaryBtn onClick={handleOk}>Ok</EmpConfigPrimaryBtn>
        </div>
      }
    >
      <EmpConfigTransferPanel
        availableLabel="Colunas disponíveis"
        usedLabel="Colunas em uso"
        usedCountLabel="colunas"
        availableItems={filteredAvailable}
        usedItems={filteredUsed}
        allAvailableItems={availableColumns}
        allUsedItems={usedColumns}
        selectedAvailableIds={selectedAvailableIds}
        selectedUsedIds={selectedUsedIds}
        search={search}
        searchUsed={searchUsed}
        onSearchChange={(event) => setSearch(event.target.value)}
        onSearchUsedChange={(event) => setSearchUsed(event.target.value)}
        searchPlaceholder="Procurar coluna"
        searchUsedPlaceholder="Procurar coluna em uso"
        onSelectAvailable={selectAvailable}
        onSelectUsed={selectUsed}
        onAddSelected={() => {
          addColumns(selectedAvailableIds);
          setSelectedAvailableIds([]);
        }}
        onAddAll={() => {
          const allIds = orderedColumns.map((col) => col.id);
          updateDraftLayout(allIds, allIds, draftFrozenColumnCount);
          setSelectedAvailableIds([]);
        }}
        onRemoveSelected={() => {
          removeColumns(selectedUsedIds);
          setSelectedUsedIds([]);
        }}
        onRemoveAll={() => {
          updateDraftLayout([], [], 0);
          setSelectedUsedIds([]);
        }}
        onDropToAvailable={dropToAvailable}
        onDropToUsed={dropToUsed}
        draggedItemId={draggedColumnId}
        onStartDrag={startDrag}
        onFinishDrag={finishDrag}
        onReorderUsedByDrop={reorderUsedByDrop}
        emptyAvailableMessage="Nenhuma coluna disponível."
        emptyUsedMessage="Nenhuma coluna em uso encontrada."
        renderUsedItemExtra={(_col, index) => (
          <span
            role="button"
            tabIndex={index > draftFrozenColumnCount ? -1 : 0}
            aria-disabled={index > draftFrozenColumnCount}
            title={
              index < draftFrozenColumnCount
                ? "Coluna congelada"
                : index === draftFrozenColumnCount
                  ? "Congelar coluna"
                  : "Congele as colunas anteriores primeiro"
            }
            onClick={(event) => {
              if (index > draftFrozenColumnCount) return;
              toggleFreezeColumn(index, event);
            }}
            onKeyDown={(event) => {
              if (index > draftFrozenColumnCount) return;
              if (event.key === "Enter" || event.key === " ") {
                toggleFreezeColumn(index, event);
              }
            }}
            className={`emp-config-transfer-freeze flex h-5 w-5 shrink-0 items-center justify-center ${
              index > draftFrozenColumnCount ? "cursor-not-allowed opacity-40" : "cursor-pointer"
            }`}
          >
            <Columns3 className="h-3.5 w-3.5 text-black" />
          </span>
        )}
      />
    </EmpConfigDialogFrame>
  );
}

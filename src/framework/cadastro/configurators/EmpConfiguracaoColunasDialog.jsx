import React, { useMemo, useState } from "react";
import { Columns3 } from "lucide-react";
import { showWarning } from "@/shared/feedback";
import {
  EmpConfigDialogFrame,
  EmpConfigTransferPanel,
  EMP_CONFIG_TRANSFER_DIALOG_CLASS,
} from "@/framework/cadastro/configurators/EmpConfigDialogKit";

export default function EmpConfiguracaoColunasDialog({
  open,
  onOpenChange,
  moduleTitle = "Cadastro",
  colunasDisponiveis = [],
  colunasVisiveis = [],
  colunasOrdem = [],
  frozenColumnCount = 0,
  onChange,
  onResetDefault,
}) {
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedUsedIds, setSelectedUsedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [searchUsed, setSearchUsed] = useState("");
  const [draggedColumnId, setDraggedColumnId] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  const orderedColumns = useMemo(() => {
    const byId = new Map(colunasDisponiveis.filter((col) => !col.fixo).map((col) => [col.id, col]));
    const orderedIds = [...colunasOrdem, ...colunasDisponiveis.map((col) => col.id)].filter(
      (id, index, arr) => byId.has(id) && arr.indexOf(id) === index
    );
    return orderedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [colunasDisponiveis, colunasOrdem]);

  const usedColumns = orderedColumns.filter((col) => colunasVisiveis.includes(col.id));
  const availableColumns = orderedColumns.filter((col) => !colunasVisiveis.includes(col.id));
  const filteredAvailable = availableColumns.filter((col) =>
    String(col.label || "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsed = usedColumns.filter((col) =>
    String(col.label || "").toLowerCase().includes(searchUsed.toLowerCase())
  );

  const commitLayout = (nextVisible, nextUsedOrder, nextFrozenCount = frozenColumnCount) => {
    const remainingIds = orderedColumns
      .map((col) => col.id)
      .filter((id) => !nextUsedOrder.includes(id));
    onChange?.({
      visiveis: nextVisible,
      ordem: [...nextUsedOrder, ...remainingIds],
      frozenColumnCount: Math.min(nextFrozenCount, nextUsedOrder.length),
    });
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
    const nextVisible = Array.from(new Set([...colunasVisiveis, ...ids]));
    const nextUsedOrder = [
      ...usedColumns.map((col) => col.id),
      ...ids.filter((id) => !colunasVisiveis.includes(id)),
    ];
    commitLayout(nextVisible, nextUsedOrder);
  };

  const removeColumns = (ids) => {
    if (!ids.length) return;
    const nextVisible = colunasVisiveis.filter((id) => !ids.includes(id));
    const nextUsedOrder = usedColumns.map((col) => col.id).filter((id) => !ids.includes(id));
    commitLayout(nextVisible, nextUsedOrder);
  };

  const moveSelected = (direction) => {
    if (selectedUsedIds.length !== 1) return;
    const currentOrder = usedColumns.map((col) => col.id);
    const index = currentOrder.indexOf(selectedUsedIds[0]);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) return;
    [currentOrder[index], currentOrder[nextIndex]] = [currentOrder[nextIndex], currentOrder[index]];
    commitLayout(currentOrder, currentOrder);
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
    commitLayout(currentOrder, currentOrder);
  };

  const requestClose = () => {
    if (usedColumns.length === 0) {
      showWarning("É necessário manter pelo menos uma coluna em uso para fechar a configuração.");
      return;
    }
    onOpenChange(false);
  };

  const toggleFreezeColumn = (index, event) => {
    event.stopPropagation();
    if (index === frozenColumnCount) {
      commitLayout(colunasVisiveis, usedColumns.map((col) => col.id), frozenColumnCount + 1);
    }
    if (index === frozenColumnCount - 1) {
      commitLayout(colunasVisiveis, usedColumns.map((col) => col.id), frozenColumnCount - 1);
    }
  };

  return (
    <EmpConfigDialogFrame
      open={open}
      onOpenChange={onOpenChange}
      onRequestClose={requestClose}
      title={`Configuração das colunas - ${moduleTitle}`}
      badgeLabel="Colunas"
      infoTitle={`Configuração das colunas - ${moduleTitle}`}
      dialogClassName={EMP_CONFIG_TRANSFER_DIALOG_CLASS}
      onRestoreDefault={onResetDefault}
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
          commitLayout(allIds, allIds);
          setSelectedAvailableIds([]);
        }}
        onRemoveSelected={() => {
          removeColumns(selectedUsedIds);
          setSelectedUsedIds([]);
        }}
        onRemoveAll={() => {
          commitLayout([], []);
          setSelectedUsedIds([]);
        }}
        onMoveUp={() => moveSelected(-1)}
        onMoveDown={() => moveSelected(1)}
        onDropToAvailable={dropToAvailable}
        onDropToUsed={dropToUsed}
        draggedItemId={draggedColumnId}
        onStartDrag={startDrag}
        onFinishDrag={finishDrag}
        onReorderUsedByDrop={reorderUsedByDrop}
        emptyAvailableMessage="Nenhuma coluna disponível."
        emptyUsedMessage="Nenhuma coluna em uso encontrada."
        renderUsedItemExtra={(_col, index) => (
          <button
            type="button"
            title={
              index < frozenColumnCount
                ? "Coluna congelada"
                : index === frozenColumnCount
                  ? "Congelar coluna"
                  : "Congele as colunas anteriores primeiro"
            }
            onClick={(event) => toggleFreezeColumn(index, event)}
            disabled={index > frozenColumnCount}
            className="emp-config-transfer-freeze flex h-5 w-5 shrink-0 items-center justify-center disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Columns3
              className={`h-3.5 w-3.5 transition-colors ${
                index < frozenColumnCount
                  ? "text-[var(--mg-brand-green,#40de63)]"
                  : index === frozenColumnCount
                    ? "text-[var(--text-3,#9ca3af)]"
                    : "text-[var(--text-3,#9ca3af)] opacity-50"
              }`}
            />
          </button>
        )}
      />
    </EmpConfigDialogFrame>
  );
}

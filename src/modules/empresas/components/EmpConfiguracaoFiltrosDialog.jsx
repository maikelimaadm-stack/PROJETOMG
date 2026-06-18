import React, { useMemo, useState } from "react";
import { RotateCcw } from "lucide-react";
import { showWarning } from "@/shared/feedback";
import {
  EmpConfigDialogFrame,
  EmpConfigRestoreBtn,
  EmpConfigTransferPanel,
  EMP_CONFIG_TRANSFER_DIALOG_CLASS,
} from "@/framework/cadastro/configurators/EmpConfigDialogKit";

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
    const orderedIds = [...camposOrdem, ...camposDisponiveis.map((field) => field.id)].filter(
      (id, index, arr) => byId.has(id) && arr.indexOf(id) === index
    );
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
    const nextUsedOrder = usedFields.map((field) => field.id).filter((id) => !ids.includes(id));
    commitLayout(nextVisible, nextUsedOrder);
  };

  const moveSelected = (direction) => {
    if (selectedUsedIds.length !== 1) return;
    const currentOrder = usedFields.map((field) => field.id);
    const index = currentOrder.indexOf(selectedUsedIds[0]);
    const nextIndex = index + direction;
    if (index < 0 || nextIndex < 0 || nextIndex >= currentOrder.length) return;
    [currentOrder[index], currentOrder[nextIndex]] = [currentOrder[nextIndex], currentOrder[index]];
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
    const ids = selectedUsedIds.includes(draggedFieldId) ? selectedUsedIds : [draggedFieldId];
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

  return (
    <EmpConfigDialogFrame
      open={open}
      onOpenChange={onOpenChange}
      onRequestClose={requestClose}
      title={`Configuração dos filtros - ${moduleTitle}`}
      badgeLabel="Filtros"
      infoTitle={`Configuração dos filtros - ${moduleTitle}`}
      dialogClassName={EMP_CONFIG_TRANSFER_DIALOG_CLASS}
      toolbar={
        <EmpConfigRestoreBtn onClick={onResetDefault} title="Restaurar padrão" aria-label="Restaurar padrão">
          <RotateCcw className="h-3.5 w-3.5" strokeWidth={2.2} />
        </EmpConfigRestoreBtn>
      }
    >
      <EmpConfigTransferPanel
        availableLabel="Campos disponíveis"
        usedLabel="Campos em uso"
        usedCountLabel="filtros"
        availableItems={filteredAvailable}
        usedItems={filteredUsed}
        allAvailableItems={availableFields}
        allUsedItems={usedFields}
        selectedAvailableIds={selectedAvailableIds}
        selectedUsedIds={selectedUsedIds}
        search={search}
        searchUsed={searchUsed}
        onSearchChange={(event) => setSearch(event.target.value)}
        onSearchUsedChange={(event) => setSearchUsed(event.target.value)}
        searchPlaceholder="Procurar campo"
        searchUsedPlaceholder="Procurar campo em uso"
        onSelectAvailable={selectAvailable}
        onSelectUsed={selectUsed}
        onAddSelected={() => {
          addFields(selectedAvailableIds);
          setSelectedAvailableIds([]);
        }}
        onAddAll={() => {
          const allIds = orderedFields.map((field) => field.id);
          commitLayout(allIds, allIds);
          setSelectedAvailableIds([]);
        }}
        onRemoveSelected={() => {
          removeFields(selectedUsedIds);
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
        draggedItemId={draggedFieldId}
        onStartDrag={startDrag}
        onFinishDrag={finishDrag}
        onReorderUsedByDrop={reorderUsedByDrop}
        emptyAvailableMessage="Nenhum campo disponível."
        emptyUsedMessage="Nenhum campo em uso encontrado."
      />
    </EmpConfigDialogFrame>
  );
}

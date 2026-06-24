import React, { useEffect, useMemo, useState } from "react";
import {
  EmpConfigDialogFrame,
  EmpConfigPrimaryBtn,
  EmpConfigTransferPanel,
  EMP_CONFIG_TRANSFER_DIALOG_CLASS,
} from "@/framework/cadastro/configurators/EmpConfigDialogKit";

export default function EmpConfiguracaoFiltrosDialog({
  open,
  onOpenChange,
  camposDisponiveis = [],
  camposVisiveis = [],
  camposOrdem = [],
  maxVisibleFields = 5,
  onChange,
  getRestoreDefaults,
}) {
  const [draftVisiveis, setDraftVisiveis] = useState([]);
  const [draftOrdem, setDraftOrdem] = useState([]);
  const [draftMaxVisible, setDraftMaxVisible] = useState(maxVisibleFields);
  const [selectedAvailableIds, setSelectedAvailableIds] = useState([]);
  const [selectedUsedIds, setSelectedUsedIds] = useState([]);
  const [search, setSearch] = useState("");
  const [searchUsed, setSearchUsed] = useState("");
  const [draggedFieldId, setDraggedFieldId] = useState(null);
  const [draggedFrom, setDraggedFrom] = useState(null);

  useEffect(() => {
    if (!open) return;
    setDraftVisiveis(camposVisiveis);
    setDraftOrdem(camposOrdem);
    setDraftMaxVisible(maxVisibleFields);
    setSelectedAvailableIds([]);
    setSelectedUsedIds([]);
    setSearch("");
    setSearchUsed("");
    setDraggedFieldId(null);
    setDraggedFrom(null);
  }, [open, camposVisiveis, camposOrdem, maxVisibleFields]);

  const orderedFields = useMemo(() => {
    const byId = new Map(camposDisponiveis.map((field) => [field.id, field]));
    const orderedIds = [...draftOrdem, ...camposDisponiveis.map((field) => field.id)].filter(
      (id, index, arr) => byId.has(id) && arr.indexOf(id) === index
    );
    return orderedIds.map((id) => byId.get(id)).filter(Boolean);
  }, [camposDisponiveis, draftOrdem]);

  const usedFields = orderedFields.filter((field) => draftVisiveis.includes(field.id));
  const availableFields = orderedFields.filter((field) => !draftVisiveis.includes(field.id));
  const filteredAvailable = availableFields.filter((field) =>
    String(field.label || "").toLowerCase().includes(search.toLowerCase())
  );
  const filteredUsed = usedFields.filter((field) =>
    String(field.label || "").toLowerCase().includes(searchUsed.toLowerCase())
  );

  const updateDraftLayout = (nextVisible, nextUsedOrder) => {
    const remainingIds = orderedFields
      .map((field) => field.id)
      .filter((id) => !nextUsedOrder.includes(id));
    setDraftVisiveis(nextVisible);
    setDraftOrdem([...nextUsedOrder, ...remainingIds]);
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
    const nextVisible = Array.from(new Set([...draftVisiveis, ...ids]));
    const nextUsedOrder = [
      ...usedFields.map((field) => field.id),
      ...ids.filter((id) => !draftVisiveis.includes(id)),
    ];
    updateDraftLayout(nextVisible, nextUsedOrder);
  };

  const removeFields = (ids) => {
    if (!ids.length) return;
    const nextVisible = draftVisiveis.filter((id) => !ids.includes(id));
    const nextUsedOrder = usedFields.map((field) => field.id).filter((id) => !ids.includes(id));
    updateDraftLayout(nextVisible, nextUsedOrder);
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
    updateDraftLayout(currentOrder, currentOrder);
  };

  const handleRestoreDefault = () => {
    const defaults = getRestoreDefaults?.();
    if (!defaults) return;
    setDraftVisiveis(defaults.visiveis ?? []);
    setDraftOrdem(defaults.ordem ?? []);
    setDraftMaxVisible(defaults.maxVisible ?? 5);
    setSelectedAvailableIds([]);
    setSelectedUsedIds([]);
  };

  const handleSave = () => {
    onChange?.({
      visiveis: draftVisiveis,
      ordem: draftOrdem,
      maxVisible: draftMaxVisible,
    });
    onOpenChange(false);
  };

  const requestClose = () => {
    onOpenChange(false);
  };

  return (
    <EmpConfigDialogFrame
      open={open}
      onOpenChange={onOpenChange}
      onRequestClose={requestClose}
      title="Configurar campos de filtros"
      infoTitle="Configurar campos de filtros"
      dialogClassName={EMP_CONFIG_TRANSFER_DIALOG_CLASS}
      onRestoreDefault={getRestoreDefaults ? handleRestoreDefault : null}
    >
      <div className="mb-3 flex items-center gap-3 px-1">
        <label className="text-sm text-slate-600" htmlFor="emp-filter-max-visible">
          Máximo de filtros rápidos visíveis
        </label>
        <input
          id="emp-filter-max-visible"
          type="number"
          min={1}
          max={12}
          value={draftMaxVisible}
          onChange={(event) => setDraftMaxVisible(Number(event.target.value) || 5)}
          className="w-20 rounded-md border border-slate-200 px-2 py-1 text-sm"
        />
      </div>
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
          updateDraftLayout(allIds, allIds);
          setSelectedAvailableIds([]);
        }}
        onRemoveSelected={() => {
          removeFields(selectedUsedIds);
          setSelectedUsedIds([]);
        }}
        onRemoveAll={() => {
          updateDraftLayout([], []);
          setSelectedUsedIds([]);
        }}
        onDropToAvailable={dropToAvailable}
        onDropToUsed={dropToUsed}
        draggedItemId={draggedFieldId}
        onStartDrag={startDrag}
        onFinishDrag={finishDrag}
        onReorderUsedByDrop={reorderUsedByDrop}
        emptyAvailableMessage="Nenhum campo disponível."
        emptyUsedMessage="Nenhum campo em uso encontrado."
        footer={
          <EmpConfigPrimaryBtn onClick={handleSave} title="Salvar configuração">
            <span>OK</span>
          </EmpConfigPrimaryBtn>
        }
      />
    </EmpConfigDialogFrame>
  );
}

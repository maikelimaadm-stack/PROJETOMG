import React, { useEffect, useState } from "react";
import EmpRecordToolbar from "@/framework/cadastro/toolbars/EmpRecordToolbar";

export default function FORM__MODULE_ID_PASCAL__({
  initialData = null,
  onSubmit,
  onCancel,
  onSettingsClick,
  onToggleView,
  onAttachClick,
  onFirst,
  onPrevious,
  onNext,
  onLast,
  onDelete,
  onDuplicate,
  onNew,
  total = 0,
  currentIndex = 0,
  searchValue = "",
  onSearchChange,
}) {
  const [formState, setFormState] = useState({ nome: "", status: "Ativo", observacoes: "" });

  useEffect(() => {
    if (!initialData) {
      setFormState({ nome: "", status: "Ativo", observacoes: "" });
      return;
    }
    setFormState({
      nome: initialData.nome || "",
      status: initialData.status || "Ativo",
      observacoes: initialData.observacoes || "",
      campos_personalizados: initialData.campos_personalizados || {},
    });
  }, [initialData]);

  return (
    <div className="h-full min-h-0 overflow-hidden bg-white flex flex-col">
      <EmpRecordToolbar
        title="Cadastro de __PLURAL_LABEL__"
        operationLabel={initialData?.id ? "Edição" : "Cadastro"}
        badgeLabel="__SINGULAR_LABEL__"
        showSaveActions
        showUtilityActions
        onCancel={onCancel}
        onSave={() => onSubmit?.(formState)}
        onSettingsClick={onSettingsClick}
        onAttachClick={onAttachClick}
        onToggleView={onToggleView}
        onFirst={onFirst}
        onPrevious={onPrevious}
        onNext={onNext}
        onLast={onLast}
        onDelete={onDelete}
        onDuplicate={onDuplicate}
        onNew={onNew}
        total={total}
        currentIndex={currentIndex}
        showSearch
        searchValue={searchValue}
        onSearchChange={onSearchChange}
      />
      <div className="flex-1 min-h-0 overflow-auto p-3 space-y-3">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <label className="text-xs text-slate-700 flex flex-col gap-1">
            Nome
            <input
              className="h-9 px-2 border border-slate-300 text-sm"
              value={formState.nome}
              onChange={(event) => setFormState((prev) => ({ ...prev, nome: event.target.value }))}
            />
          </label>
          <label className="text-xs text-slate-700 flex flex-col gap-1">
            Status
            <input
              className="h-9 px-2 border border-slate-300 text-sm"
              value={formState.status}
              onChange={(event) => setFormState((prev) => ({ ...prev, status: event.target.value }))}
            />
          </label>
        </div>
        <label className="text-xs text-slate-700 flex flex-col gap-1">
          Observações
          <textarea
            className="min-h-24 p-2 border border-slate-300 text-sm"
            value={formState.observacoes || ""}
            onChange={(event) => setFormState((prev) => ({ ...prev, observacoes: event.target.value }))}
          />
        </label>
      </div>
    </div>
  );
}


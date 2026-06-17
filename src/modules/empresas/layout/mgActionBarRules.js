/**
 * Regras de visibilidade da action bar MakGestão — espelha EmpListToolbar / EmpRecordToolbar.
 *
 * Tabela/cards: Novo; Excluir/Duplicar somente com seleção (Duplicar = 1 item).
 * Registro (leitura): Novo, Editar, Excluir, Duplicar.
 * Registro (edição/novo): Salvar, Cancelar (sem Novo/Editar/Excluir/Duplicar).
 */
export function resolveMgActionBarVisibility({
  showForm = false,
  formBridge = null,
  selectedCount = 0,
  hasRecord = false,
}) {
  if (!showForm) {
    return {
      showNew: true,
      showSave: false,
      showCancel: false,
      showEdit: false,
      showDelete: selectedCount > 0,
      showDuplicate: selectedCount === 1,
      secondaryToolsLocked: false,
    };
  }

  if (!formBridge) {
    if (!hasRecord) {
      return {
        showNew: false,
        showSave: true,
        showCancel: true,
        showEdit: false,
        showDelete: false,
        showDuplicate: false,
        secondaryToolsLocked: true,
      };
    }

    return {
      showNew: true,
      showSave: false,
      showCancel: false,
      showEdit: true,
      showDelete: hasRecord,
      showDuplicate: hasRecord,
      secondaryToolsLocked: false,
    };
  }

  if (formBridge.layoutConfigOpen) {
    return {
      showNew: false,
      showSave: false,
      showCancel: false,
      showEdit: false,
      showDelete: false,
      showDuplicate: false,
      secondaryToolsLocked: false,
    };
  }

  const editMode = !!formBridge.editMode;
  const isReadOnly = !!formBridge.isReadOnly;
  const isEditing = !!formBridge.isEditing;
  const isDuplicating = !!formBridge.isDuplicating;
  const showSaveActions = editMode;
  const showDeleteDuplicate = isEditing && !editMode && !isDuplicating;

  return {
    showNew: !showSaveActions,
    showSave: showSaveActions,
    showCancel: showSaveActions,
    showEdit: isReadOnly,
    showDelete: showDeleteDuplicate && hasRecord,
    showDuplicate: showDeleteDuplicate && hasRecord,
    secondaryToolsLocked: showSaveActions,
  };
}

/** Bloqueia pesquisa, filtro, visualização e mais opções durante novo/edição/duplicação. */
export function resolveMgSecondaryToolsLocked(visibility = {}) {
  return !!visibility.showSave;
}

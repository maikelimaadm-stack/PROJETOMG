/**
 * Regras de visibilidade da action bar MakGestão — espelha EmpListToolbar / EmpRecordToolbar.
 *
 * Tabela/cards: Novo; Excluir se houver seleção; Duplicar se 1 selecionado.
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
      };
    }

    return {
      showNew: true,
      showSave: false,
      showCancel: false,
      showEdit: true,
      showDelete: hasRecord,
      showDuplicate: hasRecord,
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
  };
}

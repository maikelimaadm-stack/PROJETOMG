export function resolveRecordOperationLabel({
  isEditing = false,
  editMode = false,
  isDuplicating = false,
  isSaving = false,
} = {}) {
  if (isSaving) return "SALVANDO";
  if (isDuplicating) return "NOVO REGISTRO DUPLICADO";
  if (!isEditing) return "NOVO REGISTRO";
  if (editMode) return "EDITANDO";
  return "VISUALIZANDO REGISTRO";
}

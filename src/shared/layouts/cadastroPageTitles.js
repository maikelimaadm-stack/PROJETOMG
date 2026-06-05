export function resolveCadastroPageTitle({
  moduleLabel = "Registro",
  isEditing = false,
  editMode = false,
  isDuplicating = false,
} = {}) {
  if (isDuplicating) return `Nova ${moduleLabel}`;
  if (!isEditing) return `Nova ${moduleLabel}`;
  if (editMode) return `Editando ${moduleLabel}`;
  return `Visualizando ${moduleLabel}`;
}

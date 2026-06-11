/**
 * Helpers de drag-and-drop para o configurador de layout.
 */

export const selectPanelField = (fieldId, event, setters) => {
  const multi = event.ctrlKey || event.metaKey || event.shiftKey;
  setters.setSelectedAvailableIds([]);
  setters.setSelectedPanelFieldIds((prev) => {
    if (multi) {
      return prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId];
    }
    if (prev.length === 1 && prev[0] === fieldId) return [];
    return [fieldId];
  });
};

export const selectAvailableField = (fieldId, event, setters) => {
  const multi = event.ctrlKey || event.metaKey || event.shiftKey;
  setters.setSelectedPanelFieldIds([]);
  setters.setSelectedAvailableIds((prev) => {
    if (multi) {
      return prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId];
    }
    if (prev.length === 1 && prev[0] === fieldId) return [];
    return [fieldId];
  });
};

/** Metade esquerda = before, direita = after (evita oscilação no dragOver). */
export const resolveDragInsertEdge = (event) => {
  const rect = event.currentTarget?.getBoundingClientRect?.();
  if (!rect?.width) return "before";
  return event.clientX > rect.left + rect.width / 2 ? "after" : "before";
};

/**
 * Helpers de drag-and-drop para o configurador de layout.
 */

export const resolvePointerEdge = (event, element, axis = "x") => {
  const rect = element?.getBoundingClientRect?.();
  if (!rect) return "before";
  if (axis === "y") {
    if (!rect.height) return "before";
    return event.clientY - rect.top < rect.height / 2 ? "before" : "after";
  }
  if (!rect.width) return "before";
  return event.clientX - rect.left < rect.width / 2 ? "before" : "after";
};

export const setDragGhostFromElement = (event, className = "emp-layout-config-drag-ghost") => {
  const source = event.currentTarget;
  if (!source?.cloneNode) return;
  const clone = source.cloneNode(true);
  clone.classList.add(className);
  clone.style.position = "fixed";
  clone.style.top = "-1000px";
  clone.style.left = "-1000px";
  clone.style.width = `${source.offsetWidth}px`;
  clone.style.pointerEvents = "none";
  document.body.appendChild(clone);
  const rect = source.getBoundingClientRect();
  event.dataTransfer.setDragImage(
    clone,
    Math.max(0, event.clientX - rect.left),
    Math.max(0, event.clientY - rect.top)
  );
  window.setTimeout(() => clone.remove(), 0);
};

export const toggleListSelection = (setter, fieldId, event) => {
  if (event.ctrlKey || event.metaKey || event.shiftKey) {
    setter((prev) =>
      prev.includes(fieldId) ? prev.filter((id) => id !== fieldId) : [...prev, fieldId]
    );
    return;
  }
  setter((prev) => (prev.length === 1 && prev[0] === fieldId ? [] : [fieldId]));
};

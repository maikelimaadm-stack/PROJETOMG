/**
 * Drag & Drop API — designer-agnostic DnD contract.
 */
export function createDragDropApi() {
  const listeners = new Set();
  let activeDrag = null;

  return Object.freeze({
    startDrag: (payload) => {
      activeDrag = Object.freeze({ ...payload, startedAt: Date.now() });
      listeners.forEach((listener) => listener({ type: "start", drag: activeDrag }));
      return activeDrag;
    },
    updateDrag: (patch) => {
      if (!activeDrag) return null;
      activeDrag = Object.freeze({ ...activeDrag, ...patch });
      listeners.forEach((listener) => listener({ type: "update", drag: activeDrag }));
      return activeDrag;
    },
    endDrag: (result = null) => {
      const drag = activeDrag;
      activeDrag = null;
      listeners.forEach((listener) => listener({ type: "end", drag, result }));
      return result;
    },
    getActiveDrag: () => activeDrag,
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export default createDragDropApi;

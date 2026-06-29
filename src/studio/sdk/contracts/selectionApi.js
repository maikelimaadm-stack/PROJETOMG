/**
 * Selection API — shared selection state across Explorer, Outline, Workspace.
 * @param {object} [options]
 */
export function createSelectionApi(options = {}) {
  const listeners = new Set();
  let selection = Object.freeze({
    entryId: options.entryId ?? null,
    entryType: options.entryType ?? null,
    moduleId: options.moduleId ?? null,
    designerId: options.designerId ?? null,
    payloadPath: options.payloadPath ?? null,
  });

  const notify = () => {
    listeners.forEach((listener) => listener(selection));
  };

  return Object.freeze({
    getSelection: () => selection,
    setSelection: (next) => {
      selection = Object.freeze({
        entryId: next?.entryId ?? null,
        entryType: next?.entryType ?? null,
        moduleId: next?.moduleId ?? selection.moduleId,
        designerId: next?.designerId ?? selection.designerId,
        payloadPath: next?.payloadPath ?? null,
      });
      notify();
      return selection;
    },
    clearSelection: () => {
      selection = Object.freeze({
        ...selection,
        entryId: null,
        entryType: null,
        payloadPath: null,
      });
      notify();
      return selection;
    },
    subscribe: (listener) => {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
  });
}

export default createSelectionApi;

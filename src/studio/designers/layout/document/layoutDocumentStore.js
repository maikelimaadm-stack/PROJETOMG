import { createEmptyLayoutDocument, validateLayoutDocument } from "./layoutDocumentContracts.js";

/** Immutable layout document store — all mutations via commands only */
export function createLayoutDocumentStore(initialDocument) {
  let state = initialDocument ?? createEmptyLayoutDocument();
  const listeners = new Set();

  const notify = () => listeners.forEach((cb) => cb(state));

  return Object.freeze({
    getState: () => state,
    subscribe(listener) {
      listeners.add(listener);
      return () => listeners.delete(listener);
    },
    /** Internal — only command bus may call */
    _replaceDocument(nextDocument) {
      const validation = validateLayoutDocument(nextDocument);
      if (!validation.valid) {
        throw new Error(validation.errors.join(" "));
      }
      state = Object.freeze({
        ...nextDocument,
        pages: Object.freeze(nextDocument.pages ?? []),
        bindings: Object.freeze(nextDocument.bindings ?? []),
        rules: Object.freeze(nextDocument.rules ?? []),
        styles: Object.freeze(nextDocument.styles ?? {}),
        behaviors: Object.freeze(nextDocument.behaviors ?? []),
        metadata: Object.freeze(nextDocument.metadata ?? {}),
      });
      notify();
      return state;
    },
  });
}

export default createLayoutDocumentStore;

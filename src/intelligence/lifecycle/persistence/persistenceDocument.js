import { upsertPersistenceDoc } from "./durableLifecycleStore.js";
import { PERSISTENCE_DOCUMENT_TYPES, PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";

export function buildPersistenceDocument(groupId, ctx, summary) {
  if (!ctx?.authorized) return Object.freeze({ document: null });
  const doc = Object.freeze({
    documentId: `lpdoc-${groupId}-${Date.now()}`,
    groupId,
    docType: PERSISTENCE_DOCUMENT_TYPES.PERSISTENCE,
    title: "Persistência de ciclo de vida",
    summary: summary?.headline ?? "Ciclo de vida com persistência durável e trilha completa.",
    ownership: PERSISTENCE_OWNERSHIP,
    explainable: true,
    createdAt: new Date().toISOString(),
  });
  upsertPersistenceDoc(doc);
  return Object.freeze({ document: doc, explainable: true });
}

export default buildPersistenceDocument;

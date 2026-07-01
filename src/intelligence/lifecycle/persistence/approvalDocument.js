import { upsertApprovalDoc } from "./durableLifecycleStore.js";
import { PERSISTENCE_DOCUMENT_TYPES, PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";

export function buildApprovalDocument(groupId, ctx, requests) {
  if (!ctx?.authorized) return Object.freeze({ document: null });
  const pending = (requests ?? []).filter((r) => r.status === "pending").length;
  const doc = Object.freeze({
    documentId: `lapdoc-${groupId}-${Date.now()}`,
    groupId,
    docType: PERSISTENCE_DOCUMENT_TYPES.APPROVAL,
    title: "Workflow de aprovação",
    summary: `${pending} solicitações aguardando decisão humana.`,
    ownership: PERSISTENCE_OWNERSHIP,
    explainable: true,
    createdAt: new Date().toISOString(),
  });
  upsertApprovalDoc(doc);
  return Object.freeze({ document: doc, explainable: true });
}

export default buildApprovalDocument;

import { SYNC_DOCUMENT_TYPES, SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildStorageIntegrationDocument(groupId, ctx, actions = []) {
  return Object.freeze({
    document: Object.freeze({
      documentId: `lstor-doc-${groupId}-${Date.now()}`,
      documentType: SYNC_DOCUMENT_TYPES.STORAGE,
      groupId,
      tenantId: ctx.tenantId,
      actionCount: actions.length,
      confirmedCount: actions.filter((a) => a.status === "confirmed").length,
      recordedAt: new Date().toISOString(),
    }),
    actions: actions.slice(0, 20),
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default buildStorageIntegrationDocument;

import { SYNC_DOCUMENT_TYPES, SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildSyncDocument(groupId, ctx, summary) {
  return Object.freeze({
    document: Object.freeze({
      documentId: `lsync-doc-${groupId}-${Date.now()}`,
      documentType: SYNC_DOCUMENT_TYPES.SYNC,
      groupId,
      tenantId: ctx.tenantId,
      headline: summary?.headline ?? "Sincronização de ciclo de vida",
      syncedCount: summary?.syncedCount ?? 0,
      divergedCount: summary?.divergedCount ?? 0,
      recordedAt: new Date().toISOString(),
    }),
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default buildSyncDocument;

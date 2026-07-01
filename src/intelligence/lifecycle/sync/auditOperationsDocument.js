import { SYNC_DOCUMENT_TYPES, SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";

export function buildAuditOperationsDocument(groupId, ctx, auditEntries = []) {
  return Object.freeze({
    document: Object.freeze({
      documentId: `laudit-doc-${groupId}-${Date.now()}`,
      documentType: SYNC_DOCUMENT_TYPES.AUDIT_OPS,
      groupId,
      tenantId: ctx.tenantId,
      persistedCount: auditEntries.length,
      recordedAt: new Date().toISOString(),
    }),
    auditEntries: auditEntries.slice(0, 30),
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export default buildAuditOperationsDocument;

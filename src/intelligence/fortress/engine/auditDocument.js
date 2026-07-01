import { createFortressDocument, upsertAuditDoc } from "./fortressStore.js";
import { registerAuditVersion } from "./fortressVersioning.js";
import { buildAuditLineage } from "./fortressLineage.js";

export function buildAuditDocument(groupId, ctx, summary) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });

  const doc = upsertAuditDoc(
    createFortressDocument({
      documentId: `faud-doc-${groupId}-${Date.now()}`,
      groupId,
      docType: "fortress.audit",
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      title: "Documento de auditoria",
      summary: summary.audit?.headline ?? summary.headline,
      lifecycleState: "active",
      lineage: buildAuditLineage({ groupId, governanceAuditRef: "governance-audit" }),
    })
  );

  registerAuditVersion(groupId, doc.documentId);
  return Object.freeze({ authorized: true, document: doc, explainable: true });
}

export default buildAuditDocument;

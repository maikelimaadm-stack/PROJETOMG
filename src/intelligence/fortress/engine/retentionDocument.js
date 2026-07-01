import { createFortressDocument, upsertRetentionDoc } from "./fortressStore.js";
import { registerRetentionVersion } from "./fortressVersioning.js";
import { buildRetentionLineage } from "./fortressLineage.js";

export function buildRetentionDocument(groupId, ctx, summary) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });

  const doc = upsertRetentionDoc(
    createFortressDocument({
      documentId: `fret-doc-${groupId}-${Date.now()}`,
      groupId,
      docType: "fortress.retention",
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      title: "Documento de retenção",
      summary: summary.retention?.headline ?? summary.headline,
      lifecycleState: "active",
      lineage: buildRetentionLineage({ groupId, governanceRef: "governance-retention" }),
    })
  );

  registerRetentionVersion(groupId, doc.documentId);
  return Object.freeze({ authorized: true, document: doc, explainable: true });
}

export default buildRetentionDocument;

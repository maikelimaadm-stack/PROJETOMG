import { createFortressDocument, upsertComplianceDoc } from "./fortressStore.js";
import { registerComplianceVersion } from "./fortressVersioning.js";
import { buildComplianceLineage } from "./fortressLineage.js";

export function buildComplianceDocument(groupId, ctx, summary) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });

  const doc = upsertComplianceDoc(
    createFortressDocument({
      documentId: `fcomp-doc-${groupId}-${Date.now()}`,
      groupId,
      docType: "fortress.compliance",
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      title: "Documento de compliance",
      summary: summary.compliance?.headline ?? summary.headline,
      lifecycleState: "active",
      lineage: buildComplianceLineage({ groupId, governanceRef: ctx.governanceSummary?.headline }),
    })
  );

  registerComplianceVersion(groupId, doc.documentId);
  return Object.freeze({ authorized: true, document: doc, explainable: true });
}

export default buildComplianceDocument;

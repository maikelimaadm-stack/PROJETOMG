import { createGovernanceDocument, upsertGovernanceDocument } from "./platformGovernanceStore.js";
import { registerGovernanceVersion } from "./governanceVersioning.js";

export function buildGovernanceDocument(groupId, ctx, summary, controlCenter) {
  if (!ctx.authorized) return Object.freeze({ authorized: false });

  const doc = upsertGovernanceDocument(
    createGovernanceDocument({
      documentId: `gdoc-${groupId}-${Date.now()}`,
      groupId,
      ownerClientId: ctx.ownerClientId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      title: "Documento de governança da plataforma",
      summary: summary.headline,
      lifecycleState: "active",
    })
  );

  registerGovernanceVersion(groupId, doc.documentId);
  return Object.freeze({ authorized: true, document: doc, controlCenter, explainable: true });
}

export default buildGovernanceDocument;

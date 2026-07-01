import { upsertLifecycleDoc, createLifecycleDocument } from "./lifecycleStore.js";
import { LIFECYCLE_DOCUMENT_TYPES } from "./dataLifecycleContracts.js";

export function buildLifecycleDocument(groupId, ctx, summaryDetail) {
  if (!ctx.authorized) return Object.freeze({ document: null });

  const doc = createLifecycleDocument({
    groupId,
    docType: LIFECYCLE_DOCUMENT_TYPES.LIFECYCLE,
    ownerClientId: ctx.ownerClientId,
    authorizedTenantIds: ctx.authorizedTenantIds,
    title: "Ciclo de vida de dados",
    summary: summaryDetail?.headline ?? "Ciclo de vida consolidado com retenção, arquivo e expurgo controlado.",
    lifecycleState: "active",
  });

  upsertLifecycleDoc(doc);
  return Object.freeze({ document: doc, explainable: true });
}

export default buildLifecycleDocument;

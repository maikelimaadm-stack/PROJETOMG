import { upsertCorporateReference } from "./corporateIntelligenceStore.js";
import { appendCorporateAuditEntry } from "./corporateIntelligenceAuditTrail.js";

export function buildCorporateReferenceRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ references: [] });

  const references = [
    upsertCorporateReference(
      Object.freeze({
        referenceId: `cref-${groupId}-process`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Referência interna por processo",
        processArea: ctx.segmentationSummary?.segmentLabel ?? "Operacional",
        summary: "Práticas de referência identificadas entre empresas autorizadas do grupo.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendCorporateAuditEntry({ groupId, action: "references_built", entityType: "reference" });

  return Object.freeze({ references });
}

export default buildCorporateReferenceRegistry;

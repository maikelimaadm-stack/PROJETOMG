import { CONSULTING_DOCUMENT_TYPES } from "./consultingEngineContracts.js";
import { upsertConsultingDocument } from "./consultingEngineStore.js";
import { appendConsultingAuditEntry } from "./consultingAuditTrail.js";
import { buildConsultingLineage } from "./consultingLineage.js";
import { createConsultingDocument } from "./consultingEngineStore.js";

export function registerConsultingOpportunity(input) {
  const doc = createConsultingDocument({
    tenantId: input.tenantId,
    documentType: CONSULTING_DOCUMENT_TYPES.OPPORTUNITY,
    title: input.title ?? "Oportunidade de melhoria",
    summary: input.summary ?? input.explanation ?? "",
    lineage: buildConsultingLineage(input),
    evidenceRefs: input.evidenceRefs ?? [],
  });
  upsertConsultingDocument(doc);
  appendConsultingAuditEntry({
    tenantId: doc.tenantId,
    action: "opportunity_registered",
    entityId: doc.documentId,
    entityType: "opportunity",
  });
  return doc;
}

export default registerConsultingOpportunity;

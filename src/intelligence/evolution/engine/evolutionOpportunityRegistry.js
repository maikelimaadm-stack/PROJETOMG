import { EVOLUTION_DOCUMENT_TYPES } from "./evolutionEngineContracts.js";
import { createEvolutionDocument, upsertEvolutionDocument } from "./evolutionEngineStore.js";
import { appendEvolutionAuditEntry } from "./evolutionAuditTrail.js";
import { buildEvolutionLineage } from "./evolutionLineage.js";

export function registerEvolutionOpportunity(input) {
  const doc = createEvolutionDocument({
    tenantId: input.tenantId,
    documentType: EVOLUTION_DOCUMENT_TYPES.ANALYSIS,
    title: input.title ?? "Oportunidade de evolução",
    summary: input.summary ?? input.explanation ?? "",
    lineage: buildEvolutionLineage(input),
    evidenceRefs: input.evidenceRefs ?? [],
  });
  upsertEvolutionDocument(doc);
  appendEvolutionAuditEntry({
    tenantId: doc.tenantId,
    action: "opportunity_registered",
    entityId: doc.evolutionId,
    entityType: "opportunity",
  });
  return doc;
}

export default registerEvolutionOpportunity;

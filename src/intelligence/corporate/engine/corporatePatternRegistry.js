import { upsertCorporatePattern } from "./corporateIntelligenceStore.js";
import { appendCorporateAuditEntry } from "./corporateIntelligenceAuditTrail.js";

export function buildCorporatePatternRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ patterns: [] });

  const patterns = [
    upsertCorporatePattern(
      Object.freeze({
        patternId: `cpat-${groupId}-adoption`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: "Padrão de adoção consolidado",
        summary: "Empresas do grupo estão adotando recomendações de forma consistente.",
        consolidationLevel: ctx.adoptionSummary?.acceptedCount > 0 ? "emerging" : "nascent",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendCorporateAuditEntry({ groupId, action: "patterns_built", entityType: "pattern" });

  return Object.freeze({ patterns });
}

export default buildCorporatePatternRegistry;

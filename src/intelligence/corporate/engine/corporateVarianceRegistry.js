import { upsertCorporateVariance } from "./corporateIntelligenceStore.js";
import { appendCorporateAuditEntry } from "./corporateIntelligenceAuditTrail.js";

export function buildCorporateVarianceRegistry(groupId, ctx) {
  if (!ctx.authorized) return Object.freeze({ variances: [] });

  const adoptionProgress = ctx.adoptionSummary?.overallProgressPercent ?? 0;
  const belowStandard = adoptionProgress < 50;

  const variances = [
    upsertCorporateVariance(
      Object.freeze({
        varianceId: `cvar-${groupId}-adoption`,
        groupId,
        authorizedTenantIds: ctx.authorizedTenantIds,
        label: belowStandard ? "Desvio de adoção identificado" : "Adoção dentro do padrão",
        deviationType: belowStandard ? "below_standard" : "within_standard",
        summary: belowStandard
          ? "Algumas empresas do grupo estão abaixo do padrão esperado de adoção."
          : "Empresas do grupo seguem padrão de adoção esperado.",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    ),
  ];

  appendCorporateAuditEntry({ groupId, action: "variances_built", entityType: "variance" });

  return Object.freeze({ variances });
}

export default buildCorporateVarianceRegistry;

import { upsertCorporateHealthRecord } from "./corporateIntelligenceStore.js";
import { appendCorporateAuditEntry } from "./corporateIntelligenceAuditTrail.js";

export function aggregateCorporateHealth(groupId, ctx) {
  if (!ctx.authorized) {
    return Object.freeze({ authorized: false, healthRecords: [] });
  }

  const adoptionProgress = ctx.adoptionSummary?.overallProgressPercent ?? 0;
  const maturityLevel = ctx.dnaSummary?.maturityLevel ?? "emerging";
  const segmentLabel = ctx.segmentationSummary?.segmentLabel ?? "Não classificado";

  const healthScore = Math.round((adoptionProgress + (ctx.dnaSummary?.maturityScore ?? 50)) / 2);

  const record = upsertCorporateHealthRecord(
    Object.freeze({
      healthId: `chealth-${groupId}-${Date.now()}`,
      groupId,
      authorizedTenantIds: ctx.authorizedTenantIds,
      healthScore,
      adoptionProgressPercent: adoptionProgress,
      maturityLevel,
      segmentLabel,
      summary: `Saúde corporativa do grupo: ${healthScore}% — ${ctx.authorizedTenantIds.length} empresas autorizadas.`,
      explainable: true,
      recordedAt: new Date().toISOString(),
    })
  );

  appendCorporateAuditEntry({
    groupId,
    action: "health_aggregated",
    entityId: record.healthId,
    entityType: "health",
  });

  return Object.freeze({
    authorized: true,
    healthRecords: Object.freeze([record]),
    healthScore,
    explainable: true,
  });
}

export default aggregateCorporateHealth;

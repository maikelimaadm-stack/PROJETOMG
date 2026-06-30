import { upsertDnaGrowthSignal } from "./businessDnaStore.js";

export function registerDnaGrowthSignals(tenantId, maturity, ctx) {
  const signals = [];
  for (const cap of maturity.needsMaturation) {
    signals.push(
      upsertDnaGrowthSignal(
        Object.freeze({
          signalId: `bgs-${tenantId}-${cap.domainId}`,
          tenantId,
          label: `Oportunidade de amadurecimento: ${cap.label}`,
          description: `O domínio ${cap.label} está em nível ${cap.level} e pode evoluir.`,
          domainId: cap.domainId,
          severity: "medium",
          explainable: true,
          organizationalScope: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }
  if ((ctx.evolutionSummary?.averageProgress ?? 0) > 0) {
    signals.push(
      upsertDnaGrowthSignal(
        Object.freeze({
          signalId: `bgs-${tenantId}-progress`,
          tenantId,
          label: "Progresso de evolução em curso",
          description: `Progresso médio de ${ctx.evolutionSummary.averageProgress}% nas melhorias.`,
          severity: "low",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }
  return Object.freeze(signals);
}

export default registerDnaGrowthSignals;

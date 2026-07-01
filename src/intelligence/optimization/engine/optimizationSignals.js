import { OPTIMIZATION_SIGNAL_TYPES } from "./optimizationEngineContracts.js";
import { upsertOptimizationSignal } from "./optimizationEngineStore.js";
import { appendOptimizationAuditEntry } from "./optimizationAuditTrail.js";

export function registerOptimizationSignals(tenantId, ctx) {
  const signals = [];
  const improvementSummary = ctx.improvementSummary;

  if (improvementSummary?.validatedImpactCount > 0) {
    signals.push(
      upsertOptimizationSignal(
        Object.freeze({
          signalId: `osig-${tenantId}-improvement-effect`,
          tenantId,
          type: OPTIMIZATION_SIGNAL_TYPES.IMPROVEMENT_EFFECT,
          label: "Efeito positivo de melhorias anteriores",
          summary: `${improvementSummary.validatedImpactCount} melhorias geraram impacto — reforçar práticas.`,
          strength: "high",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  if (improvementSummary?.activeCycleCount > 0) {
    signals.push(
      upsertOptimizationSignal(
        Object.freeze({
          signalId: `osig-${tenantId}-adoption-feedback`,
          tenantId,
          type: OPTIMIZATION_SIGNAL_TYPES.ADOPTION_FEEDBACK,
          label: "Feedback de adoção em ciclo",
          summary: "Adoções em andamento alimentam próxima rodada de otimização.",
          strength: "medium",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  signals.push(
    upsertOptimizationSignal(
      Object.freeze({
        signalId: `osig-${tenantId}-waste-reduction`,
        tenantId,
        type: OPTIMIZATION_SIGNAL_TYPES.WASTE_REDUCTION,
        label: "Oportunidade de reduzir atrito operacional",
        summary: "Identificar desperdício com base em padrões de workflow e adoção.",
        strength: "medium",
        explainable: true,
        recordedAt: new Date().toISOString(),
      })
    )
  );

  appendOptimizationAuditEntry({ tenantId, action: "signals_registered", entityType: "signal" });

  return Object.freeze(signals);
}

export default registerOptimizationSignals;

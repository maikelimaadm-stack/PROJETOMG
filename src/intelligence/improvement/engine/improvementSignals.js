import { IMPROVEMENT_SIGNAL_TYPES } from "./improvementEngineContracts.js";
import { upsertImprovementSignal } from "./improvementEngineStore.js";
import { appendImprovementAuditEntry } from "./improvementAuditTrail.js";

export function registerImprovementSignals(tenantId, ctx) {
  const signals = [];

  if (ctx.validatedOutcomes?.length) {
    signals.push(
      upsertImprovementSignal(
        Object.freeze({
          signalId: `isig-${tenantId}-adoption-outcome`,
          tenantId,
          type: IMPROVEMENT_SIGNAL_TYPES.ADOPTION_OUTCOME,
          label: "Impacto validado após adoção",
          summary: `${ctx.validatedOutcomes.length} melhorias com impacto confirmado pela empresa.`,
          strength: "high",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  if (ctx.pendingOutcomes?.length) {
    signals.push(
      upsertImprovementSignal(
        Object.freeze({
          signalId: `isig-${tenantId}-pending-validation`,
          tenantId,
          type: IMPROVEMENT_SIGNAL_TYPES.EVOLUTION_PROGRESS,
          label: "Melhorias aguardando validação",
          summary: `${ctx.pendingOutcomes.length} adoções concluídas aguardam confirmação de impacto.`,
          strength: "medium",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  if (ctx.dnaSummary?.gaps?.length) {
    signals.push(
      upsertImprovementSignal(
        Object.freeze({
          signalId: `isig-${tenantId}-maturity-gap`,
          tenantId,
          type: IMPROVEMENT_SIGNAL_TYPES.MATURITY_GAP,
          label: "Lacunas de maturidade identificadas",
          summary: "Capacidades abaixo do esperado — oportunidade de novo ciclo de melhoria.",
          strength: "medium",
          explainable: true,
          recordedAt: new Date().toISOString(),
        })
      )
    );
  }

  appendImprovementAuditEntry({ tenantId, action: "signals_registered", entityType: "signal" });

  return Object.freeze(signals);
}

export default registerImprovementSignals;

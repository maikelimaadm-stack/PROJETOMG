import { EVOLUTION_SIGNAL_TYPES } from "./evolutionEngineContracts.js";
import { upsertEvolutionSignal } from "./evolutionEngineStore.js";
import { appendEvolutionAuditEntry } from "./evolutionAuditTrail.js";
import { buildEvolutionLineage } from "./evolutionLineage.js";

export function registerEvolutionSignal(input) {
  const signal = Object.freeze({
    signalId: input.signalId ?? `esig-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    signalType: input.signalType ?? EVOLUTION_SIGNAL_TYPES.IMPROVEMENT,
    summary: input.summary,
    severity: input.severity ?? "medium",
    lineage: buildEvolutionLineage(input),
    recordedAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
    autonomousExecutionForbidden: true,
  });
  upsertEvolutionSignal(signal);
  appendEvolutionAuditEntry({
    tenantId: signal.tenantId,
    action: "signal_registered",
    entityId: signal.signalId,
    entityType: "signal",
  });
  return signal;
}

export default registerEvolutionSignal;

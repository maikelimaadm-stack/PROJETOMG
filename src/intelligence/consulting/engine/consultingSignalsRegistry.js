import { CONSULTING_SIGNAL_TYPES } from "./consultingEngineContracts.js";
import { upsertConsultingSignal, listEngineConsultingSignals } from "./consultingEngineStore.js";
import { appendConsultingAuditEntry } from "./consultingAuditTrail.js";
import { buildConsultingLineage } from "./consultingLineage.js";

export function registerConsultingEngineSignal(input) {
  const signal = Object.freeze({
    signalId: input.signalId ?? `csig-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    signalType: input.signalType ?? CONSULTING_SIGNAL_TYPES.IMPROVEMENT,
    summary: input.summary,
    severity: input.severity ?? "medium",
    evidenceRefs: Object.freeze(input.evidenceRefs ?? []),
    lineage: buildConsultingLineage(input),
    recordedAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
    autonomousAdviceForbidden: true,
  });
  upsertConsultingSignal(signal);
  appendConsultingAuditEntry({
    tenantId: signal.tenantId,
    action: "signal_registered",
    entityId: signal.signalId,
    entityType: "signal",
  });
  return signal;
}

export { listEngineConsultingSignals as listConsultingEngineSignals };

export default registerConsultingEngineSignal;

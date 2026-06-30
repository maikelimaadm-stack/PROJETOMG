const signals = [];

/** Consulting-ready signals — preparatory, not Consulting Engine */
export function emitConsultingSignal(input) {
  const signal = Object.freeze({
    signalId: `con-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    signalType: input.signalType ?? "operational",
    summary: input.summary,
    evidenceRefs: Object.freeze(input.evidenceRefs ?? []),
    recordedAt: new Date().toISOString(),
    engineReady: false,
    autonomousAdviceForbidden: true,
  });
  signals.unshift(signal);
  return signal;
}

export function listConsultingSignals(tenantId = "default") {
  return signals.filter((s) => s.tenantId === tenantId);
}

export default emitConsultingSignal;

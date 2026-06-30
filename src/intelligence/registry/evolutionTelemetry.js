const telemetryLog = [];

/** Evolution-ready telemetry — feeds future Evolution Engine */
export function recordEvolutionTelemetry(input) {
  const entry = Object.freeze({
    telemetryId: `tel-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    recordedAt: new Date().toISOString(),
    observationCount: input.observationCount ?? 0,
    patternCount: input.patternCount ?? 0,
    healthSignalCount: input.healthSignalCount ?? 0,
    evolutionEngineReady: false,
    autoEvolutionForbidden: true,
  });
  telemetryLog.unshift(entry);
  return entry;
}

export function listEvolutionTelemetry(tenantId = "default") {
  return telemetryLog.filter((t) => t.tenantId === tenantId);
}

export default recordEvolutionTelemetry;

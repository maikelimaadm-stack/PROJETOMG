export function createResolverTelemetry(session, stages) {
  const started = Date.parse(session.startedAt);
  const completed = session.completedAt ? Date.parse(session.completedAt) : Date.now();

  return Object.freeze({
    schemaVersion: "mak-resolver-telemetry-v1",
    sessionId: session.resolverSessionId,
    durationMs: completed - started,
    stageLatency: Object.freeze({ ...stages }),
    derivationCount: stages.derivationCount ?? 0,
    cacheHits: stages.cacheHits ?? 0,
    mode: session.mode,
    trigger: session.trigger,
  });
}

export default createResolverTelemetry;

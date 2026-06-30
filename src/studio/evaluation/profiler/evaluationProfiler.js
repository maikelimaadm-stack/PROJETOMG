/** Evaluation Profiler — lightweight profiling (Program 2.3.5) */

export function createEvaluationProfiler() {
  const spans = [];

  return Object.freeze({
    startSpan(name, ownerId = null) {
      const span = { name, ownerId, startedAt: Date.now() };
      return Object.freeze({
        end(extra = {}) {
          const endedAt = Date.now();
          const record = Object.freeze({
            name,
            ownerId,
            durationMs: endedAt - span.startedAt,
            ...extra,
          });
          spans.push(record);
          return record;
        },
      });
    },
    snapshot() {
      return Object.freeze({
        spanCount: spans.length,
        totalMs: spans.reduce((sum, s) => sum + s.durationMs, 0),
        spans: Object.freeze([...spans]),
      });
    },
    clear() {
      spans.length = 0;
    },
  });
}

export default createEvaluationProfiler;

/** Evaluation Diagnostics — execution diagnostics (Program 2.3.5) */

export function createEvaluationDiagnostics() {
  const entries = [];

  return Object.freeze({
    record(partial) {
      const entry = Object.freeze({
        code: partial.code ?? "EVAL_INFO",
        severity: partial.severity ?? "info",
        message: partial.message ?? "",
        ownerId: partial.ownerId ?? null,
        timestamp: Date.now(),
      });
      entries.push(entry);
      return entry;
    },
    list() {
      return Object.freeze([...entries]);
    },
    clear() {
      entries.length = 0;
    },
    snapshot() {
      return Object.freeze({
        count: entries.length,
        entries: Object.freeze([...entries]),
      });
    },
  });
}

export default createEvaluationDiagnostics;

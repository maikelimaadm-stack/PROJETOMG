import { EVALUATION_SESSION_VERSION } from "../contracts/evaluationContracts.js";
import { createEvaluationContext } from "../context/evaluationContext.js";

/** Evaluation Session — scoped evaluation run (Program 2.3.5) */

export function createEvaluationSession(partial = {}) {
  const sessionId = partial.sessionId ?? `eval-session-${Date.now()}`;
  const context = partial.context ?? createEvaluationContext({ sessionId, designerId: partial.designerId });
  const results = [];
  const startedAt = Date.now();

  return Object.freeze({
    version: EVALUATION_SESSION_VERSION,
    sessionId,
    context,
    designerId: partial.designerId ?? "studio",
    recordResult(result) {
      results.push(result);
    },
    getResults() {
      return Object.freeze([...results]);
    },
    close() {
      return Object.freeze({
        sessionId,
        durationMs: Date.now() - startedAt,
        resultCount: results.length,
        results: Object.freeze([...results]),
      });
    },
  });
}

export default createEvaluationSession;

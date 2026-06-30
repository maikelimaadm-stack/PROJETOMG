import { retrieveMemoryRecords } from "./memoryRetrieval.js";
import { explainMemoryRecord } from "./memoryExplainability.js";

/** Memory replay — reconstruct sequence of relevant events in business language */
export function replayMemorySequence(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const records = retrieveMemoryRecords(tenantId, {
    workflowId: options.workflowId,
    intentId: options.intentId,
    assetId: options.assetId,
    since: options.since,
    limit,
  }).sort((a, b) => new Date(a.occurredAt) - new Date(b.occurredAt));

  return Object.freeze({
    tenantId,
    replayId: `replay-${tenantId}-${Date.now()}`,
    replayedAt: new Date().toISOString(),
    scope: Object.freeze({
      workflowId: options.workflowId ?? null,
      intentId: options.intentId ?? null,
      assetId: options.assetId ?? null,
    }),
    steps: Object.freeze(
      records.map((record, index) =>
        Object.freeze({
          step: index + 1,
          when: record.occurredAt,
          what: record.explainability?.whatHappened ?? record.eventType,
          why: record.whyItHappened ?? explainMemoryRecord(record).why,
          who: record.actorId ?? "Operação",
          outcome: record.outcome?.status ?? null,
          memoryId: record.memoryId,
        })
      )
    ),
    explainable: true,
    automatedActionForbidden: true,
  });
}

export function buildReplaySummary(replay) {
  if (!replay.steps.length) {
    return "Ainda não há histórico suficiente para replay desta operação.";
  }
  return `${replay.steps.length} passos registrados — da origem ao resultado atual.`;
}

export default replayMemorySequence;

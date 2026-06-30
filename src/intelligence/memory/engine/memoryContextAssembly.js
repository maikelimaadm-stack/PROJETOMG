import { summarizeEnterpriseMemory } from "./memorySummarization.js";
import { retrieveLatestDecisions, retrieveLatestWorkflows, retrieveMemoryRecords } from "./memoryRetrieval.js";
import { replayMemorySequence } from "./memoryReplay.js";
import { aggregateMemoryTimelineBuckets } from "./memoryAggregation.js";

/** Memory Context Assembly — explainable context for BOS and future engines */
export function assembleMemoryContext(tenantId = "default", options = {}) {
  const summary = summarizeEnterpriseMemory(tenantId);
  const recentDecisions = retrieveLatestDecisions(tenantId, options.decisionLimit ?? 5);
  const recentWorkflows = retrieveLatestWorkflows(tenantId, options.workflowLimit ?? 5);
  const recentIntents = retrieveMemoryRecords(tenantId, {
    storeType: "intent.memory.store",
    limit: options.intentLimit ?? 5,
  });
  const recentOutcomes = retrieveMemoryRecords(tenantId, {
    storeType: "outcome.memory.store",
    limit: options.outcomeLimit ?? 5,
  });
  const buckets = aggregateMemoryTimelineBuckets(tenantId);
  const replay = replayMemorySequence(tenantId, { limit: 5 });

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    summary,
    recentDecisions,
    recentWorkflows,
    recentIntents,
    recentOutcomes,
    activityBuckets: buckets,
    replayTeaser: Object.freeze({
      stepCount: replay.steps.length,
      summary:
        replay.steps.length > 0
          ? replay.steps[replay.steps.length - 1]?.why ?? "Operação em andamento registrada."
          : "A memória operacional aguarda os primeiros registros.",
    }),
    evolutionSignal:
      buckets.today > 0
        ? "Operação ativa hoje — a empresa está construindo histórico."
        : "Histórico preservado — consulte decisões e fluxos anteriores.",
    explainable: true,
    aiGenerated: false,
    belongsToEnterprise: true,
  });
}

export default assembleMemoryContext;

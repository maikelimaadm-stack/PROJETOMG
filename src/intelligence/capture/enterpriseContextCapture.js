import { listBusinessMemoryRecords } from "../memory/businessMemoryStore.js";

/** Enterprise Context — assembled view from memory (never hallucinated) */
export function captureEnterpriseContext(tenantId = "default", options = {}) {
  const limit = options.limit ?? 20;
  const memories = listBusinessMemoryRecords(tenantId, { limit });
  const recentDecisions = memories.filter((m) => m.memoryType === "decision.memory");
  const recentOutcomes = memories.filter((m) => m.memoryType === "outcome.memory");
  const activeWorkflows = memories.filter((m) => m.memoryType === "workflow.memory");

  return Object.freeze({
    tenantId,
    assembledAt: new Date().toISOString(),
    source: "business.memory.foundation",
    explainable: true,
    vocabulary: Object.freeze([]),
    recentDecisions: Object.freeze(recentDecisions.slice(0, 5)),
    recentOutcomes: Object.freeze(recentOutcomes.slice(0, 5)),
    activeWorkflowSignals: Object.freeze(activeWorkflows.slice(0, 5)),
    memoryRecordCount: memories.length,
    policies: Object.freeze([]),
    baselines: Object.freeze([]),
  });
}

export default captureEnterpriseContext;

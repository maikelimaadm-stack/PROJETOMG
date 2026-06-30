import { listEnterpriseMemoryRecords } from "../../memory/engine/enterpriseMemoryStore.js";
import { listDecisionDocuments } from "../../decision/engine/decisionEngineStore.js";
import { listImprovementPlans } from "../../consulting/engine/consultingEngineStore.js";

/** Evolution timeline from memory, decisions and plans */
export function buildEvolutionTimeline(tenantId = "default", limit = 20) {
  const memoryRecords = listEnterpriseMemoryRecords(tenantId, { limit: 50 });
  const decisions = listDecisionDocuments(tenantId, { limit: 30 });
  const plans = listImprovementPlans(tenantId, { limit: 10 });

  const events = [];

  for (const record of memoryRecords) {
    events.push(
      Object.freeze({
        id: `evt-mem-${record.memoryId}`,
        when: record.occurredAt ?? record.createdAt,
        label: record.explainability?.businessSummary ?? "Evento operacional",
        context: record.explainability?.whatHappened ?? "",
        source: "memory",
        tone: record.outcome?.terminal ? "positive" : "neutral",
      })
    );
  }

  for (const decision of decisions) {
    events.push(
      Object.freeze({
        id: `evt-dec-${decision.decisionId}`,
        when: decision.approvedAt ?? decision.createdAt,
        label: decision.title,
        context: decision.summary,
        source: "decision",
        tone: decision.lifecycleState === "approved" ? "positive" : "attention",
      })
    );
  }

  for (const plan of plans) {
    events.push(
      Object.freeze({
        id: `evt-plan-${plan.planId}`,
        when: plan.createdAt,
        label: plan.title,
        context: plan.objective,
        source: "consulting",
        tone: "neutral",
      })
    );
  }

  events.sort((a, b) => new Date(b.when) - new Date(a.when));

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    events: Object.freeze(events.slice(0, limit)),
    eventCount: events.length,
    explainable: true,
  });
}

export default buildEvolutionTimeline;

import { assembleMemoryContext } from "./memoryContextAssembly.js";
import { buildMemoryTimelineForBos } from "./memoryTimeline.js";
import { summarizeEnterpriseMemory } from "./memorySummarization.js";
import { deriveHealthSignals, computeHealthScore } from "../../signals/businessHealthSignals.js";
import { listDomainEvents } from "../../bus/domainEventBus.js";
import { MEMORY_STORE_TYPES } from "./memoryEngineContracts.js";
import { retrieveLatestDecisions, retrieveLatestWorkflows } from "./memoryRetrieval.js";

/** Memory-to-BOS projections — business vocabulary only */
export function buildMemoryEngineBosProjection(tenantId = "default") {
  const context = assembleMemoryContext(tenantId);
  const { timeline, hasMemory } = buildMemoryTimelineForBos(tenantId, 10);
  const summary = summarizeEnterpriseMemory(tenantId);

  const events = listDomainEvents(tenantId, { limit: 50 });
  const healthSignals = deriveHealthSignals(
    tenantId,
    events.map((e) => ({ eventType: e.eventType, tenantId: e.tenantId }))
  );
  const score = hasMemory ? computeHealthScore(healthSignals) : 78;

  const activity = timeline.map((item) =>
    Object.freeze({
      id: item.id,
      label: item.label,
      context: item.context,
      when: item.whenLabel,
    })
  );

  const decisions = context.recentDecisions.slice(0, 5).map((d) =>
    Object.freeze({
      id: d.memoryId,
      label: d.explainability?.whatHappened ?? "Decisão registrada",
      context: d.explainability?.businessSummary ?? "",
      when: d.occurredAt,
    })
  );

  const workflows = context.recentWorkflows.slice(0, 5).map((w) =>
    Object.freeze({
      id: w.memoryId,
      label: w.explainability?.businessSummary ?? "Fluxo registrado",
      context: w.whyItHappened ?? "",
      workflowId: w.workflowId,
    })
  );

  const whyHighlights = timeline.slice(0, 3).map((item) =>
    Object.freeze({
      id: item.id,
      title: item.label,
      because: item.why ?? item.context,
    })
  );

  return Object.freeze({
    hasMemory,
    health: Object.freeze({
      score,
      trend: score >= 75 ? "stable" : "attention",
      label: "Saúde operacional",
      highlights: healthSignals.slice(0, 3).map((s) =>
        Object.freeze({ id: s.signalId, label: s.label, value: s.value, tone: s.tone })
      ),
    }),
    activity: activity.length ? activity : null,
    operationalSummary: summary.headline,
    recentDecisions: decisions,
    recentWorkflows: workflows,
    whyHighlights,
    replayTeaser: context.replayTeaser,
    evolutionSignal: context.evolutionSignal,
    memoryContext: context,
    storeCounts: summary.byStore,
    explainable: true,
  });
}

export default buildMemoryEngineBosProjection;

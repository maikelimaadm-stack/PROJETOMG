import { retrieveMemoryRecords } from "./memoryRetrieval.js";
import { summarizeEnterpriseMemory } from "./memorySummarization.js";

function formatRelativeWhen(isoDate) {
  if (!isoDate) return "Recente";
  const diff = Date.now() - new Date(isoDate).getTime();
  if (diff < 60_000) return "Agora";
  if (diff < 3_600_000) return "Hoje";
  if (diff < 86_400_000) return "Recente";
  return new Date(isoDate).toLocaleDateString("pt-BR");
}

/** Memory timeline — ordered history for BOS and future engines */
export function buildMemoryTimeline(tenantId = "default", options = {}) {
  const records = retrieveMemoryRecords(tenantId, { limit: options.limit ?? 30 });
  return Object.freeze(
    records.map((record) =>
      Object.freeze({
        id: record.memoryId,
        when: record.occurredAt,
        whenLabel: formatRelativeWhen(record.occurredAt),
        label: record.explainability?.whatHappened ?? record.eventType,
        context: record.explainability?.businessSummary ?? "",
        storeType: record.storeType,
        why: record.whyItHappened,
        impact: record.businessImpact,
        workflowId: record.workflowId,
        intentId: record.intentId,
        assetId: record.assetId,
        actorId: record.actorId,
      })
    )
  );
}

export function buildMemoryTimelineForBos(tenantId, limit = 10) {
  const timeline = buildMemoryTimeline(tenantId, { limit });
  const summary = summarizeEnterpriseMemory(tenantId);
  return Object.freeze({
    timeline,
    summary,
    hasMemory: timeline.length > 0,
  });
}

export default buildMemoryTimeline;

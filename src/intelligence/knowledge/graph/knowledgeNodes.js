import { createKnowledgeNode, upsertKnowledgeNode } from "./knowledgeGraphStore.js";
import { KNOWLEDGE_NODE_KINDS } from "./knowledgeGraphContracts.js";

export function ensureKnowledgeNode(tenantId, kind, refId, label, extra = {}) {
  if (!refId) return null;
  const node = createKnowledgeNode({
    tenantId,
    kind,
    refId,
    label,
    description: extra.description ?? "",
    memoryId: extra.memoryId ?? null,
    lineage: extra.lineage ?? [],
  });
  return upsertKnowledgeNode(node);
}

export function nodeFromMemoryRecord(record) {
  const kindMap = {
    "workflow.memory.store": KNOWLEDGE_NODE_KINDS.WORKFLOW,
    "intent.memory.store": KNOWLEDGE_NODE_KINDS.INTENT,
    "decision.memory.store": KNOWLEDGE_NODE_KINDS.DECISION,
    "outcome.memory.store": KNOWLEDGE_NODE_KINDS.OUTCOME,
    "enterprise.memory.store": KNOWLEDGE_NODE_KINDS.HEALTH_SIGNAL,
    "operational.memory.store": KNOWLEDGE_NODE_KINDS.MEMORY,
    "business.memory.store": KNOWLEDGE_NODE_KINDS.PATTERN,
  };
  const kind = kindMap[record.storeType] ?? KNOWLEDGE_NODE_KINDS.MEMORY;
  const refId =
    record.workflowId ?? record.intentId ?? record.assetId ?? record.memoryId;
  return ensureKnowledgeNode(
    record.tenantId,
    kind,
    refId,
    record.explainability?.businessSummary ?? record.eventType,
    {
      memoryId: record.memoryId,
      lineage: record.lineage,
      description: record.whyItHappened ?? "",
    }
  );
}

export function nodeFromAsset(tenantId, assetId, assetType, label) {
  return ensureKnowledgeNode(tenantId, KNOWLEDGE_NODE_KINDS.ASSET, assetId, label, {
    description: assetType ?? "business.asset",
  });
}

export default { ensureKnowledgeNode, nodeFromMemoryRecord, nodeFromAsset };

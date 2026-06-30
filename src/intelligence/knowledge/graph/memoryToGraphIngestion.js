import { MEMORY_STORE_TYPES } from "../../memory/engine/memoryEngineContracts.js";
import { KNOWLEDGE_NODE_KINDS, KNOWLEDGE_RELATIONSHIP_KINDS } from "./knowledgeGraphContracts.js";
import { nodeFromMemoryRecord, nodeFromAsset, ensureKnowledgeNode } from "./knowledgeNodes.js";
import { linkKnowledgeNodes, RELATIONSHIP_BUILDERS } from "./knowledgeEdges.js";
import { indexKnowledgeSemantically } from "./semanticIndexing.js";
import { indexKnowledgeLineage } from "./lineageIndexing.js";
import { appendKnowledgeAuditEntry } from "./knowledgeAuditTrail.js";
import { listEnterpriseMemoryRecords } from "../../memory/engine/enterpriseMemoryStore.js";

/** Ingest memory record into Knowledge Graph */
export function ingestMemoryRecordToKnowledgeGraph(record) {
  const tenantId = record.tenantId;
  const primaryNode = nodeFromMemoryRecord(record);
  if (!primaryNode) return null;

  const edges = [];

  if (record.intentId) {
    const intentNode = ensureKnowledgeNode(
      tenantId,
      KNOWLEDGE_NODE_KINDS.INTENT,
      record.intentId,
      `Intenção ${record.intentId}`,
      { memoryId: record.memoryId, lineage: record.lineage }
    );
    if (record.assetId) {
      const assetNode = nodeFromAsset(
        tenantId,
        record.assetId,
        record.assetType,
        record.explainability?.businessSummary ?? "Ativo de negócio"
      );
      edges.push(
        RELATIONSHIP_BUILDERS.intentOriginatesAsset(tenantId, intentNode, assetNode, record.memoryId)
      );
    }
    if (primaryNode.kind === KNOWLEDGE_NODE_KINDS.WORKFLOW) {
      edges.push(
        linkKnowledgeNodes({
          tenantId,
          fromNodeId: intentNode.nodeId,
          toNodeId: primaryNode.nodeId,
          relationshipKind: KNOWLEDGE_RELATIONSHIP_KINDS.INTENT_DERIVES_WORKFLOW,
          label: "Intenção originou fluxo",
          businessSummary: "A intenção de negócio originou este fluxo de aprovação.",
          memoryId: record.memoryId,
        })
      );
    }
  }

  if (record.workflowId && primaryNode.kind !== KNOWLEDGE_NODE_KINDS.WORKFLOW) {
    const wfNode = ensureKnowledgeNode(
      tenantId,
      KNOWLEDGE_NODE_KINDS.WORKFLOW,
      record.workflowId,
      record.explainability?.businessSummary ?? "Fluxo de aprovação",
      { memoryId: record.memoryId }
    );
    if (record.assetId) {
      const assetNode = nodeFromAsset(tenantId, record.assetId, record.assetType, "Ativo vinculado");
      edges.push(
        linkKnowledgeNodes({
          tenantId,
          fromNodeId: wfNode.nodeId,
          toNodeId: assetNode.nodeId,
          relationshipKind: KNOWLEDGE_RELATIONSHIP_KINDS.WORKFLOW_USES_ASSET,
          label: "Fluxo utiliza ativo",
          businessSummary: "Este fluxo opera sobre o ativo de negócio.",
          memoryId: record.memoryId,
        })
      );
    }
  }

  if (record.storeType === MEMORY_STORE_TYPES.DECISION && record.outcome) {
    const outcomeNode = ensureKnowledgeNode(
      tenantId,
      KNOWLEDGE_NODE_KINDS.OUTCOME,
      `${record.memoryId}-outcome`,
      record.outcome.status ?? "Resultado",
      { memoryId: record.memoryId }
    );
    edges.push(
      RELATIONSHIP_BUILDERS.decisionResultsIn(tenantId, primaryNode, outcomeNode, record.memoryId)
    );
  }

  if (record.storeType === MEMORY_STORE_TYPES.OUTCOME || record.outcome?.terminal) {
    const outcomeNode = ensureKnowledgeNode(
      tenantId,
      KNOWLEDGE_NODE_KINDS.OUTCOME,
      record.memoryId,
      record.outcome?.status ?? "Resultado operacional",
      { memoryId: record.memoryId }
    );
    edges.push(
      RELATIONSHIP_BUILDERS.memoryEvidenceOutcome(tenantId, primaryNode, outcomeNode, record.memoryId)
    );
  }

  indexKnowledgeSemantically(tenantId, primaryNode, edges);
  indexKnowledgeLineage(tenantId, primaryNode);
  for (const edge of edges) indexKnowledgeLineage(tenantId, edge);

  appendKnowledgeAuditEntry({
    tenantId,
    action: "ingested_from_memory",
    nodeId: primaryNode.nodeId,
  });

  return Object.freeze({ node: primaryNode, edges });
}

/** Replay graph build from all memory records for tenant */
export function replayKnowledgeGraphFromMemory(tenantId = "default") {
  const records = listEnterpriseMemoryRecords(tenantId, { limit: 500 });
  const ingested = records.map(ingestMemoryRecordToKnowledgeGraph).filter(Boolean);
  return Object.freeze({
    tenantId,
    replayedAt: new Date().toISOString(),
    recordCount: records.length,
    ingestedCount: ingested.length,
    explainable: true,
  });
}

export default ingestMemoryRecordToKnowledgeGraph;

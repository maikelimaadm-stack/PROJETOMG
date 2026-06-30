import { upsertKnowledgeEdge } from "./knowledgeGraphStore.js";
import { KNOWLEDGE_EDGE_SCHEMA_VERSION, KNOWLEDGE_RELATIONSHIP_KINDS } from "./knowledgeGraphContracts.js";
import { createRelationshipExplainability } from "./knowledgeExplainability.js";

export function createKnowledgeEdge(partial) {
  return Object.freeze({
    schemaVersion: KNOWLEDGE_EDGE_SCHEMA_VERSION,
    edgeId:
      partial.edgeId ??
      `kedge-${partial.tenantId}-${partial.fromNodeId}-${partial.toNodeId}-${partial.relationshipKind}`,
    tenantId: partial.tenantId ?? "default",
    fromNodeId: partial.fromNodeId,
    toNodeId: partial.toNodeId,
    relationshipKind: partial.relationshipKind,
    label: partial.label ?? "Relacionamento de negócio",
    explainability: createRelationshipExplainability(partial),
    memoryId: partial.memoryId ?? null,
    lineage: Object.freeze(partial.lineage ?? []),
    indexedAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
  });
}

export function linkKnowledgeNodes(input) {
  const edge = createKnowledgeEdge(input);
  return upsertKnowledgeEdge(edge);
}

export const RELATIONSHIP_BUILDERS = Object.freeze({
  intentOriginatesAsset: (tenantId, intentNode, assetNode, memoryId) =>
    linkKnowledgeNodes({
      tenantId,
      fromNodeId: intentNode.nodeId,
      toNodeId: assetNode.nodeId,
      relationshipKind: KNOWLEDGE_RELATIONSHIP_KINDS.INTENT_ORIGINATES_ASSET,
      label: "Intenção originou ativo",
      businessSummary: `A intenção "${intentNode.label}" originou o ativo "${assetNode.label}".`,
      memoryId,
    }),
  workflowImpactsOutcome: (tenantId, workflowNode, outcomeNode, memoryId) =>
    linkKnowledgeNodes({
      tenantId,
      fromNodeId: workflowNode.nodeId,
      toNodeId: outcomeNode.nodeId,
      relationshipKind: KNOWLEDGE_RELATIONSHIP_KINDS.WORKFLOW_IMPACTS_OUTCOME,
      label: "Fluxo impactou resultado",
      businessSummary: `O fluxo "${workflowNode.label}" impactou o resultado "${outcomeNode.label}".`,
      memoryId,
    }),
  decisionResultsIn: (tenantId, decisionNode, outcomeNode, memoryId) =>
    linkKnowledgeNodes({
      tenantId,
      fromNodeId: decisionNode.nodeId,
      toNodeId: outcomeNode.nodeId,
      relationshipKind: KNOWLEDGE_RELATIONSHIP_KINDS.DECISION_RESULTS_IN,
      label: "Decisão gerou resultado",
      businessSummary: `A decisão "${decisionNode.label}" gerou o resultado "${outcomeNode.label}".`,
      memoryId,
    }),
  memoryEvidenceOutcome: (tenantId, memoryNode, outcomeNode, memoryId) =>
    linkKnowledgeNodes({
      tenantId,
      fromNodeId: memoryNode.nodeId,
      toNodeId: outcomeNode.nodeId,
      relationshipKind: KNOWLEDGE_RELATIONSHIP_KINDS.MEMORY_EVIDENCE_OUTCOME,
      label: "Memória comprova resultado",
      businessSummary: "Registro operacional comprova o resultado de negócio.",
      memoryId,
    }),
});

export default { createKnowledgeEdge, linkKnowledgeNodes, RELATIONSHIP_BUILDERS };

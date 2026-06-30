import { summarizeKnowledgeGraph } from "./knowledgeSummarization.js";
import { retrieveKnowledgeByContext } from "./knowledgeRetrieval.js";
import { listKnowledgeEdges, listKnowledgeNodes } from "./knowledgeGraphStore.js";
import { KNOWLEDGE_RELATIONSHIP_KINDS, KNOWLEDGE_NODE_KINDS } from "./knowledgeGraphContracts.js";
import { explainKnowledgeRelationship } from "./knowledgeExplainability.js";

/** Knowledge-to-BOS projections — business vocabulary, no graph jargon */
export function buildKnowledgeGraphBosProjection(tenantId = "default") {
  const summary = summarizeKnowledgeGraph(tenantId);
  const nodes = listKnowledgeNodes(tenantId, { limit: 50 });
  const edges = listKnowledgeEdges(tenantId, { limit: 100 });
  const hasGraph = nodes.length > 0;

  const assetRelations = edges
    .filter((e) => e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.WORKFLOW_USES_ASSET ||
      e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.ASSET_RELATES_ASSET ||
      e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.INTENT_ORIGINATES_ASSET)
    .slice(0, 5)
    .map((e) => formatRelationForBos(e, nodes));

  const decisionOutcomeLinks = edges
    .filter((e) =>
      e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.DECISION_RESULTS_IN ||
      e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.OUTCOME_FOLLOWS_DECISION
    )
    .slice(0, 5)
    .map((e) => formatRelationForBos(e, nodes));

  const operationalContext = retrieveKnowledgeByContext(tenantId, {
    relationshipKind: KNOWLEDGE_RELATIONSHIP_KINDS.MEMORY_EVIDENCE_OUTCOME,
    limit: 5,
  });

  const recurringPatterns = edges
    .filter((e) => e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.PATTERN_RECURS_OPERATION)
    .slice(0, 3)
    .map((e) => explainKnowledgeRelationship(e));

  const contextShortcuts = nodes
    .filter((n) => [KNOWLEDGE_NODE_KINDS.WORKFLOW, KNOWLEDGE_NODE_KINDS.ASSET, KNOWLEDGE_NODE_KINDS.INTENT].includes(n.kind))
    .slice(0, 5)
    .map((n) =>
      Object.freeze({
        id: n.nodeId,
        label: n.label,
        context: n.description || "Entidade operacional da empresa",
        refId: n.refId,
      })
    );

  const whyRelated = edges.slice(0, 3).map((e) =>
    Object.freeze({
      id: e.edgeId,
      title: e.label,
      because: e.explainability?.whyRelated ?? e.explainability?.businessSummary ?? "",
    })
  );

  return Object.freeze({
    hasGraph,
    summary: summary.headline,
    graphSummary: summary,
    assetRelations,
    decisionOutcomeLinks,
    operationalContextEdges: operationalContext.edges,
    recurringPatterns,
    contextShortcuts,
    whyRelated,
    explainable: true,
  });
}

function formatRelationForBos(edge, nodes) {
  const from = nodes.find((n) => n.nodeId === edge.fromNodeId);
  const to = nodes.find((n) => n.nodeId === edge.toNodeId);
  return Object.freeze({
    id: edge.edgeId,
    label: edge.label,
    fromLabel: from?.label ?? "Origem",
    toLabel: to?.label ?? "Destino",
    because: edge.explainability?.whyRelated ?? edge.explainability?.businessSummary ?? "",
  });
}

export default buildKnowledgeGraphBosProjection;

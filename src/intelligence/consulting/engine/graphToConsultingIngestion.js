import { CONSULTING_SIGNAL_TYPES, CONSULTING_DOCUMENT_TYPES } from "./consultingEngineContracts.js";
import { assembleConsultingContext } from "./consultingContextAssembly.js";
import { registerConsultingEngineSignal } from "./consultingSignalsRegistry.js";
import { registerConsultingOpportunity } from "./consultingOpportunityRegistry.js";
import { buildConsultingRecommendation } from "./recommendationBuilder.js";
import { buildImprovementPlan } from "./improvementPlanBuilder.js";
import { upsertConsultingDocument } from "./consultingEngineStore.js";
import { createConsultingDocument } from "./consultingEngineStore.js";
import { appendConsultingAuditEntry } from "./consultingAuditTrail.js";
import { KNOWLEDGE_RELATIONSHIP_KINDS } from "../../knowledge/graph/knowledgeGraphContracts.js";
import { listEnterpriseMemoryRecords } from "../../memory/engine/enterpriseMemoryStore.js";
import { replayKnowledgeGraphFromMemory } from "../../knowledge/graph/memoryToGraphIngestion.js";
import { summarizeConsultingEngine } from "./consultingSummarization.js";

const SIGNAL_RULES = [
  {
    test: (ctx) => ctx.graphSummary.recurringPatterns > 0,
    signalType: CONSULTING_SIGNAL_TYPES.PATTERN,
    summary: (ctx) =>
      `${ctx.graphSummary.recurringPatterns} padrão(ões) operacional(is) recorrente(s) identificado(s).`,
    priority: "medium",
  },
  {
    test: (ctx) => ctx.observation?.healthSignals?.some((s) => s.severity === "attention"),
    signalType: CONSULTING_SIGNAL_TYPES.HEALTH_DECLINE,
    summary: () => "Saúde operacional requer atenção — sinais abaixo do ideal.",
    priority: "high",
  },
  {
    test: (ctx) => ctx.graphEdges?.some((e) => e.relationshipKind === KNOWLEDGE_RELATIONSHIP_KINDS.WORKFLOW_IMPACTS_OUTCOME),
    signalType: CONSULTING_SIGNAL_TYPES.BOTTLENECK,
    summary: () => "Fluxos com impacto direto em resultados — revisar gargalos potenciais.",
    priority: "medium",
  },
];

function buildEvidenceRefs(ctx) {
  const refs = [];
  for (const node of (ctx.graphNodes ?? []).slice(0, 3)) {
    refs.push(Object.freeze({ type: "knowledge.node", refId: node.nodeId, label: node.label }));
  }
  for (const edge of (ctx.graphEdges ?? []).slice(0, 2)) {
    refs.push(Object.freeze({ type: "knowledge.edge", refId: edge.edgeId, label: edge.label }));
  }
  return refs;
}

/** Analyze context and produce consulting artifacts — observational only */
export function analyzeConsultingContext(tenantId = "default") {
  const ctx = assembleConsultingContext(tenantId);
  const signals = [];
  const recommendations = [];
  const opportunities = [];

  for (const rule of SIGNAL_RULES) {
    if (rule.test(ctx)) {
      const signal = registerConsultingEngineSignal({
        tenantId,
        signalType: rule.signalType,
        summary: rule.summary(ctx),
        evidenceRefs: buildEvidenceRefs(ctx),
        nodeIds: (ctx.graphNodes ?? []).slice(0, 3).map((n) => n.nodeId),
        edgeIds: (ctx.graphEdges ?? []).slice(0, 2).map((e) => e.edgeId),
      });
      signals.push(signal);
    }
  }

  for (const opp of ctx.opportunities ?? []) {
    const doc = registerConsultingOpportunity({
      tenantId,
      title: opp.title,
      summary: opp.explanation,
      evidenceRefs: [{ type: "improvement.opportunity", refId: opp.opportunityId }],
    });
    opportunities.push(doc);
  }

  if (ctx.graphSummary.nodeCount > 0 || ctx.memorySummary.recordCount > 0) {
    const rec = buildConsultingRecommendation({
      tenantId,
      title: "Revisar conexões operacionais prioritárias",
      explanation:
        "Memória e conhecimento organizacional indicam relações entre fluxos, decisões e resultados que merecem revisão humana.",
      expectedImpact: "Melhor alinhamento entre operação e resultados de negócio.",
      priority: signals.some((s) => s.severity === "high") ? "high" : "medium",
      confidence: ctx.graphSummary.edgeCount >= 2 ? "high" : "medium",
      evidenceRefs: buildEvidenceRefs(ctx),
      nodeIds: (ctx.graphNodes ?? []).slice(0, 5).map((n) => n.nodeId),
      memoryIds: (ctx.memoryContext?.recentDecisions ?? []).slice(0, 3).map((d) => d.memoryId),
    });
    recommendations.push(rec);
  }

  if (recommendations.length > 0) {
    buildImprovementPlan({
      tenantId,
      title: "Plano de melhoria operacional sugerido",
      objective: "Endereçar oportunidades identificadas a partir de memória e conhecimento da empresa.",
      recommendationIds: recommendations.map((r) => r.recommendationId),
      expectedImpact: recommendations[0].expectedImpact,
      priority: recommendations[0].priority,
    });
  }

  const analysisDoc = createConsultingDocument({
    tenantId,
    documentType: CONSULTING_DOCUMENT_TYPES.ANALYSIS,
    title: "Análise operacional consolidada",
    summary: summarizeConsultingEngine(tenantId).headline,
    evidenceRefs: buildEvidenceRefs(ctx),
  });
  upsertConsultingDocument(analysisDoc);

  appendConsultingAuditEntry({
    tenantId,
    action: "context_analyzed",
    entityId: analysisDoc.documentId,
    entityType: "analysis",
  });

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    signals,
    recommendations,
    opportunities,
    analysisDocument: analysisDoc,
    explainable: true,
    autonomousExecutionForbidden: true,
  });
}

/** Ingest from knowledge graph node/edge update — non-blocking trigger */
export function ingestKnowledgeGraphToConsulting(tenantId, graphResult) {
  if (!graphResult?.node) return null;
  return analyzeConsultingContext(tenantId);
}

/** Replay consulting analysis from memory + graph */
export function replayConsultingFromMemoryAndGraph(tenantId = "default") {
  replayKnowledgeGraphFromMemory(tenantId);
  const analysis = analyzeConsultingContext(tenantId);
  return Object.freeze({
    tenantId,
    replayedAt: new Date().toISOString(),
    memoryRecordCount: listEnterpriseMemoryRecords(tenantId, { limit: 500 }).length,
    analysis,
    explainable: true,
  });
}

export default { analyzeConsultingContext, ingestKnowledgeGraphToConsulting, replayConsultingFromMemoryAndGraph };

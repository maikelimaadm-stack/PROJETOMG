import { DECISION_DOCUMENT_TYPES, DECISION_LIFECYCLE_STATES } from "./decisionEngineContracts.js";
import { assembleDecisionContext } from "./decisionContextAssembly.js";
import { buildDecisionLineage } from "./decisionLineage.js";
import { scoreDecisionConfidence } from "./confidenceScoring.js";
import { buildDecisionAlternatives } from "./alternativesBuilder.js";
import { simulateDecisionScenarios } from "./scenarioSimulation.js";
import { registerDecisionEvidence } from "./decisionEvidenceRegistry.js";
import {
  createDecisionDocument,
  upsertDecisionDocument,
} from "./decisionEngineStore.js";
import { appendDecisionAuditEntry } from "./decisionAuditTrail.js";
import { registerDecisionVersion } from "./decisionVersioning.js";
import { summarizeDecisionEngine } from "./decisionSummarization.js";
import { replayConsultingFromMemoryAndGraph } from "../../consulting/engine/graphToConsultingIngestion.js";

/** Analyze consulting output and produce decision support artifacts */
export function analyzeDecisionContext(tenantId = "default") {
  const ctx = assembleDecisionContext(tenantId);
  const decisions = [];
  const recommendations = ctx.consultingRetrieved?.recommendations ?? [];

  for (const rec of recommendations.slice(0, 3)) {
    const lineage = buildDecisionLineage({
      consultingIds: [rec.recommendationId],
      memoryIds: (ctx.memoryContext?.recentDecisions ?? []).slice(0, 2).map((d) => d.memoryId),
      nodeIds: (ctx.graphNodes ?? []).slice(0, 2).map((n) => n.nodeId),
      planIds: (ctx.consultingRetrieved?.plans ?? []).slice(0, 1).map((p) => p.planId),
    });

    const confidenceResult = scoreDecisionConfidence({
      evidenceCount: rec.evidenceRefs?.length ?? 0,
      hasConsultingRecommendation: true,
      hasKnowledgeGraphContext: (ctx.graphSummary?.nodeCount ?? 0) > 0,
      hasMemoryHistory: (ctx.memorySummary?.recordCount ?? 0) > 0,
    });

    const decision = createDecisionDocument({
      tenantId,
      documentType: DECISION_DOCUMENT_TYPES.PENDING,
      title: `Decisão: ${rec.title}`,
      summary: rec.explanation,
      lifecycleState: DECISION_LIFECYCLE_STATES[1],
      confidence: confidenceResult.level,
      lineage,
      evidenceRefs: rec.evidenceRefs ?? [],
      consultingRefId: rec.recommendationId,
    });
    registerDecisionVersion(tenantId, decision.decisionId);
    upsertDecisionDocument(decision);

    for (const ref of rec.evidenceRefs ?? []) {
      registerDecisionEvidence({
        tenantId,
        decisionId: decision.decisionId,
        source: ref.type ?? "consulting",
        label: ref.label ?? "Evidência",
        refId: ref.refId,
      });
    }

    const alternatives = buildDecisionAlternatives({
      tenantId,
      decisionId: decision.decisionId,
      expectedImpact: rec.expectedImpact,
      confidence: confidenceResult.level,
    });

    simulateDecisionScenarios({
      tenantId,
      decisionId: decision.decisionId,
      approveOptionId: alternatives.find((a) => a.optionType === "decision.option.approve")?.optionId,
      rejectOptionId: alternatives.find((a) => a.optionType === "decision.option.reject")?.optionId,
      deferOptionId: alternatives.find((a) => a.optionType === "decision.option.defer")?.optionId,
      approveOutcome: rec.expectedImpact,
    });

    appendDecisionAuditEntry({
      tenantId,
      action: "decision_created_from_consulting",
      entityId: decision.decisionId,
      entityType: "decision",
    });

    decisions.push(decision);
  }

  if (decisions.length === 0 && (ctx.memorySummary?.recordCount ?? 0) > 0) {
    const decision = createDecisionDocument({
      tenantId,
      documentType: DECISION_DOCUMENT_TYPES.ANALYSIS,
      title: "Análise decisória operacional",
      summary: "Contexto operacional disponível para apoio à decisão humana.",
      lifecycleState: DECISION_LIFECYCLE_STATES[0],
      confidence: "medium",
      lineage: buildDecisionLineage({
        memoryIds: (ctx.memoryContext?.recentDecisions ?? []).slice(0, 1).map((d) => d.memoryId),
      }),
    });
    upsertDecisionDocument(decision);
    buildDecisionAlternatives({ tenantId, decisionId: decision.decisionId });
    simulateDecisionScenarios({ tenantId, decisionId: decision.decisionId });
    decisions.push(decision);
  }

  return Object.freeze({
    tenantId,
    analyzedAt: new Date().toISOString(),
    decisions,
    summary: summarizeDecisionEngine(tenantId),
    explainable: true,
    autonomousExecutionForbidden: true,
  });
}

/** Ingest from consulting analysis — non-blocking trigger */
export function ingestConsultingToDecision(tenantId) {
  return analyzeDecisionContext(tenantId);
}

/** Replay decision analysis from full stack */
export function replayDecisionFromStack(tenantId = "default") {
  replayConsultingFromMemoryAndGraph(tenantId);
  const analysis = analyzeDecisionContext(tenantId);
  return Object.freeze({
    tenantId,
    replayedAt: new Date().toISOString(),
    analysis,
    explainable: true,
  });
}

export default { analyzeDecisionContext, ingestConsultingToDecision, replayDecisionFromStack };

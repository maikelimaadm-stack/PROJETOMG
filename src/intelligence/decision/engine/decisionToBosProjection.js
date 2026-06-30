import { summarizeDecisionEngine } from "./decisionSummarization.js";
import { retrieveDecisionsByContext } from "./decisionRetrieval.js";
import { explainDecisionDocument, explainDecisionOption } from "./decisionExplainability.js";
import { analyzeDecisionContext } from "./consultingToDecisionIngestion.js";

/** Decision-to-BOS projections — business vocabulary, no technical jargon */
export function buildDecisionEngineBosProjection(tenantId = "default") {
  let summary = summarizeDecisionEngine(tenantId);
  if (summary.decisionCount === 0) {
    analyzeDecisionContext(tenantId);
    summary = summarizeDecisionEngine(tenantId);
  }

  const retrieved = retrieveDecisionsByContext(tenantId);
  const hasDecisions = retrieved.documents.length > 0;

  const pendingDecisions = retrieved.pendingDecisions.slice(0, 5).map((d) => {
    const explained = explainDecisionDocument(d);
    return Object.freeze({
      id: d.decisionId,
      label: d.title,
      context: d.summary,
      confidence: d.confidence,
      status: d.lifecycleState,
      evidenceCount: explained.evidenceCount,
    });
  });

  const alternatives = retrieved.options.slice(0, 9).map((o) => {
    const explained = explainDecisionOption(o);
    return Object.freeze({
      id: o.optionId,
      decisionId: o.decisionId,
      label: o.label,
      impact: o.expectedImpact,
      risk: o.riskLevel,
      confidence: o.confidence,
      because: explained.because,
    });
  });

  const scenarios = retrieved.scenarios.slice(0, 6).map((s) =>
    Object.freeze({
      id: s.scenarioId,
      label: s.label,
      description: s.description,
      outcome: s.expectedOutcome,
      probability: s.probability,
    })
  );

  const evidenceHighlights = retrieved.evidence.slice(0, 5).map((e) =>
    Object.freeze({
      id: e.evidenceId,
      title: e.label,
      because: e.description || "Evidência operacional da empresa",
      source: e.source,
    })
  );

  const decisionHistory = retrieved.documents
    .filter((d) => d.lifecycleState === "approved" || d.lifecycleState === "rejected")
    .slice(0, 5)
    .map((d) =>
      Object.freeze({
        id: d.decisionId,
        label: d.title,
        status: d.lifecycleState,
        when: d.approvedAt ?? d.rejectedAt ?? d.createdAt,
      })
    );

  const whyImportant = retrieved.pendingDecisions.slice(0, 3).map((d) =>
    Object.freeze({
      id: d.decisionId,
      title: d.title,
      because: d.summary,
    })
  );

  const nextAction = pendingDecisions.length
    ? Object.freeze({
        label: "Revisar decisão pendente",
        context: pendingDecisions[0].label,
        requiresHuman: true,
      })
    : null;

  return Object.freeze({
    hasDecisions,
    summary: summary.headline,
    decisionSummary: summary,
    pendingDecisions,
    alternatives,
    scenarios,
    evidenceHighlights,
    decisionHistory,
    whyImportant,
    nextAction,
    explainable: true,
    autonomousExecutionForbidden: true,
  });
}

export default buildDecisionEngineBosProjection;

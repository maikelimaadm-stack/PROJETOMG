import {
  listDecisionDocuments,
  listDecisionOptions,
  listDecisionScenarios,
} from "./decisionEngineStore.js";

export function summarizeDecisionEngine(tenantId = "default") {
  const documents = listDecisionDocuments(tenantId, { limit: 200 });
  const options = listDecisionOptions(tenantId, { limit: 400 });
  const scenarios = listDecisionScenarios(tenantId, { limit: 100 });

  const pending = documents.filter(
    (d) => d.lifecycleState === "pending_approval" || d.lifecycleState === "draft"
  );
  const approved = documents.filter((d) => d.lifecycleState === "approved");

  return Object.freeze({
    tenantId,
    summarizedAt: new Date().toISOString(),
    decisionCount: documents.length,
    pendingCount: pending.length,
    approvedCount: approved.length,
    optionCount: options.length,
    scenarioCount: scenarios.length,
    headline:
      documents.length === 0
        ? "O apoio à decisão está pronto para organizar alternativas a partir de memória, conhecimento e consultoria."
        : `${pending.length} decisão(ões) pendente(s) com ${options.length} alternativas comparáveis.`,
    explainable: true,
    aiGenerated: false,
    belongsToEnterprise: true,
    autonomousExecutionForbidden: true,
  });
}

export default summarizeDecisionEngine;

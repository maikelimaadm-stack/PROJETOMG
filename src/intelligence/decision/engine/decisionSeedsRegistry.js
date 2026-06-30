import { listDecisionDocuments, listDecisionOptions } from "./decisionEngineStore.js";
import { summarizeDecisionEngine } from "./decisionSummarization.js";

export function buildDecisionSeedsRegistry(tenantId = "default") {
  const summary = summarizeDecisionEngine(tenantId);
  const documents = listDecisionDocuments(tenantId, { limit: 10 });
  const options = listDecisionOptions(tenantId, { limit: 20 });

  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    seedCount: documents.length + options.length,
    decisionSeeds: documents.map((d) =>
      Object.freeze({ id: d.decisionId, title: d.title, state: d.lifecycleState })
    ),
    optionSeeds: options.map((o) => Object.freeze({ id: o.optionId, label: o.label })),
    summary,
    forEvolutionEngine: false,
  });
}

export default buildDecisionSeedsRegistry;

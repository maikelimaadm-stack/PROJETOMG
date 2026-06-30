import { createDecisionScenario, upsertDecisionScenario } from "./decisionEngineStore.js";
import { appendDecisionAuditEntry } from "./decisionAuditTrail.js";

/** Scenario simulation — explainable projections, not autonomous execution */
export function simulateDecisionScenarios(input) {
  const scenarios = [];
  const base = {
    tenantId: input.tenantId,
    decisionId: input.decisionId,
  };

  const approveScenario = createDecisionScenario({
    ...base,
    label: "Cenário: Aprovação",
    description: "Se a decisão for aprovada, a operação segue o caminho sugerido.",
    probability: input.approveProbability ?? "high",
    expectedOutcome: input.approveOutcome ?? "Melhoria operacional alinhada ao plano de negócio.",
    optionId: input.approveOptionId ?? null,
  });
  upsertDecisionScenario(approveScenario);
  scenarios.push(approveScenario);

  const rejectScenario = createDecisionScenario({
    ...base,
    label: "Cenário: Rejeição",
    description: "Se a decisão for rejeitada, a operação permanece inalterada.",
    probability: input.rejectProbability ?? "medium",
    expectedOutcome: input.rejectOutcome ?? "Status quo preservado — revisão futura possível.",
    optionId: input.rejectOptionId ?? null,
  });
  upsertDecisionScenario(rejectScenario);
  scenarios.push(rejectScenario);

  const deferScenario = createDecisionScenario({
    ...base,
    label: "Cenário: Adiamento",
    description: "Se a decisão for adiada, mais contexto pode ser coletado antes de agir.",
    probability: input.deferProbability ?? "medium",
    expectedOutcome: input.deferOutcome ?? "Tempo para análise adicional sem impacto imediato.",
    optionId: input.deferOptionId ?? null,
  });
  upsertDecisionScenario(deferScenario);
  scenarios.push(deferScenario);

  appendDecisionAuditEntry({
    tenantId: input.tenantId,
    action: "scenarios_simulated",
    entityId: input.decisionId,
    entityType: "decision",
  });

  return Object.freeze(scenarios);
}

export default simulateDecisionScenarios;

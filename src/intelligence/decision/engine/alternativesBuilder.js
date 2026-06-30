import { DECISION_OPTION_TYPES } from "./decisionEngineContracts.js";
import { createDecisionOption, upsertDecisionOption } from "./decisionEngineStore.js";
import { appendDecisionAuditEntry } from "./decisionAuditTrail.js";

const STANDARD_ALTERNATIVES = [
  {
    optionType: DECISION_OPTION_TYPES.APPROVE,
    label: "Aprovar",
    description: "Seguir com a recomendação operacional sugerida.",
    impactTemplate: "Operação avança conforme plano sugerido — impacto positivo esperado.",
    riskLevel: "low",
  },
  {
    optionType: DECISION_OPTION_TYPES.REJECT,
    label: "Rejeitar",
    description: "Não seguir com a recomendação neste momento.",
    impactTemplate: "Operação permanece no estado atual — oportunidade pode ser revisitada.",
    riskLevel: "medium",
  },
  {
    optionType: DECISION_OPTION_TYPES.DEFER,
    label: "Adiar",
    description: "Postergar a decisão para revisão futura com mais contexto.",
    impactTemplate: "Decisão pendente — operação continua sem mudança imediata.",
    riskLevel: "low",
  },
];

/** Build comparable alternatives — presents options, never orders */
export function buildDecisionAlternatives(input) {
  const alternatives = [];
  for (const template of STANDARD_ALTERNATIVES) {
    const option = createDecisionOption({
      tenantId: input.tenantId,
      decisionId: input.decisionId,
      optionType: template.optionType,
      label: template.label,
      description: template.description,
      expectedImpact: input.expectedImpact ?? template.impactTemplate,
      riskLevel: template.riskLevel,
      confidence: input.confidence ?? "medium",
    });
    upsertDecisionOption(option);
    alternatives.push(option);
  }
  appendDecisionAuditEntry({
    tenantId: input.tenantId,
    action: "alternatives_built",
    entityId: input.decisionId,
    entityType: "decision",
  });
  return Object.freeze(alternatives);
}

export default buildDecisionAlternatives;

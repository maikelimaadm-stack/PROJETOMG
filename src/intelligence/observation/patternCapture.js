import { BUSINESS_EVENT_TYPES } from "../contracts/intelligenceContracts.js";

/** Pattern capture — detects emerging business patterns from observations */
export function detectPatternsFromEvents(observations = []) {
  const patterns = [];
  const approvalCount = observations.filter(
    (o) =>
      o.eventType === BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_APPROVE ||
      o.eventType === BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_REJECT
  ).length;
  const escalationCount = observations.filter(
    (o) => o.eventType === BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_ESCALATE
  ).length;
  const intentSuccessCount = observations.filter(
    (o) => o.eventType === BUSINESS_EVENT_TYPES.INTENT_OUTCOME_SUCCESS
  ).length;
  const returnCount = observations.filter(
    (o) => o.eventType === BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_RETURN
  ).length;

  if (approvalCount >= 2) {
    patterns.push(
      Object.freeze({
        patternId: "pattern-approval-volume",
        label: "Volume de aprovações",
        occurrences: approvalCount,
        explanation: "Decisões de aprovação/rejeição estão sendo registradas com frequência.",
        suggestImprovement: approvalCount >= 5,
        improvementTitle: "Padronizar critérios de aprovação",
      })
    );
  }

  if (escalationCount >= 1) {
    patterns.push(
      Object.freeze({
        patternId: "pattern-escalation",
        label: "Escalonamentos detectados",
        occurrences: escalationCount,
        explanation: "Processos excederam prazo e foram escalados — revisar SLAs.",
        suggestImprovement: true,
        improvementTitle: "Revisar prazos e responsáveis",
      })
    );
  }

  if (returnCount >= 2) {
    patterns.push(
      Object.freeze({
        patternId: "pattern-return-correction",
        label: "Retornos para correção",
        occurrences: returnCount,
        explanation: "Solicitações retornam frequentemente para correção antes da aprovação.",
        suggestImprovement: true,
        improvementTitle: "Melhorar qualidade na entrada do processo",
      })
    );
  }

  if (intentSuccessCount >= 1) {
    patterns.push(
      Object.freeze({
        patternId: "pattern-intent-derivation",
        label: "Derivação por intenção",
        occurrences: intentSuccessCount,
        explanation: "Ativos de negócio estão sendo criados via Business First.",
        suggestImprovement: false,
        improvementTitle: null,
      })
    );
  }

  return patterns;
}

export default detectPatternsFromEvents;

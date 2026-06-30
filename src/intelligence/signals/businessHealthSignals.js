import { BUSINESS_EVENT_TYPES } from "../contracts/intelligenceContracts.js";
import { countDomainEventsByType } from "../bus/domainEventBus.js";

/** Business Health Signals — derived from observations, not technical metrics */
export function deriveHealthSignals(tenantId = "default", observations = []) {
  const signals = [];
  const eventCounts = countDomainEventsByType(tenantId);

  const pendingWorkflows = observations.filter(
    (o) => o.eventType === BUSINESS_EVENT_TYPES.WORKFLOW_TASK_CREATED
  ).length;
  const escalations = eventCounts[BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_ESCALATE] ?? 0;
  const returns = eventCounts[BUSINESS_EVENT_TYPES.WORKFLOW_ACTION_RETURN] ?? 0;
  const intentFailures = eventCounts[BUSINESS_EVENT_TYPES.INTENT_OUTCOME_FAILED] ?? 0;
  const intentSuccess = eventCounts[BUSINESS_EVENT_TYPES.INTENT_OUTCOME_SUCCESS] ?? 0;

  signals.push(
    createHealthSignal({
      tenantId,
      signalId: "health-approval-flow",
      label: "Fluxos de aprovação",
      value: pendingWorkflows > 0 ? "Ativos" : "Sem pendências registradas",
      tone: pendingWorkflows > 0 ? "good" : "neutral",
      severity: "normal",
      explanation: "Processos derivados por intenção e registrados na operação.",
    })
  );

  if (escalations > 0) {
    signals.push(
      createHealthSignal({
        tenantId,
        signalId: "health-escalation",
        label: "Escalonamentos",
        value: `${escalations} registrado(s)`,
        tone: "warn",
        severity: "attention",
        explanation: "Prazos excedidos — revisar responsáveis e SLAs.",
      })
    );
  }

  if (returns >= 2) {
    signals.push(
      createHealthSignal({
        tenantId,
        signalId: "health-returns",
        label: "Retornos para correção",
        value: `${returns} ocorrências`,
        tone: "warn",
        severity: "attention",
        explanation: "Entrada de processos pode precisar de padronização.",
      })
    );
  }

  if (intentFailures > 0) {
    signals.push(
      createHealthSignal({
        tenantId,
        signalId: "health-intent-failures",
        label: "Intenções não resolvidas",
        value: `${intentFailures} falha(s)`,
        tone: "warn",
        severity: "attention",
        explanation: "Descrições de negócio precisaram de ajuste antes da derivação.",
      })
    );
  }

  if (intentSuccess > 0) {
    signals.push(
      createHealthSignal({
        tenantId,
        signalId: "health-intent-success",
        label: "Ativos derivados",
        value: `${intentSuccess} sucesso(s)`,
        tone: "good",
        severity: "normal",
        explanation: "Business First está produzindo ativos de negócio.",
      })
    );
  }

  return signals;
}

function createHealthSignal(partial) {
  return Object.freeze({
    signalId: partial.signalId,
    tenantId: partial.tenantId,
    label: partial.label,
    value: partial.value,
    tone: partial.tone ?? "neutral",
    severity: partial.severity ?? "normal",
    explanation: partial.explanation,
    recordedAt: new Date().toISOString(),
    explainable: true,
    automatedActionForbidden: true,
  });
}

export function computeHealthScore(signals = []) {
  if (!signals.length) return 78;
  let score = 82;
  for (const signal of signals) {
    if (signal.severity === "attention") score -= 8;
    if (signal.tone === "good") score += 2;
  }
  return Math.max(40, Math.min(98, score));
}

export default deriveHealthSignals;

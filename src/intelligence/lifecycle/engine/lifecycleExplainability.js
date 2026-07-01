export function explainLifecycleRule(rule) {
  if (!rule) return null;
  return Object.freeze({
    ruleId: rule.ruleId,
    label: rule.label,
    because: rule.summary ?? "Regra de ciclo de vida protege retenção e conformidade.",
    humanApprovalRequired: rule.humanApprovalRequired ?? true,
    explainable: true,
  });
}

export function explainLifecycleEvent(event) {
  if (!event) return null;
  return Object.freeze({
    eventId: event.eventId,
    label: event.label,
    because: event.summary ?? "Evento registrado com trilha de auditoria.",
    sensitive: event.sensitive ?? false,
    explainable: true,
  });
}

export function explainLifecycleState(state) {
  if (!state) return null;
  return Object.freeze({
    stateId: state.stateId,
    label: state.label,
    because: state.summary ?? "Estado protegido por política e auditoria.",
    currentState: state.currentState,
    explainable: true,
  });
}

export default explainLifecycleRule;

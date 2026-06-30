/** SLA e escalonamento — linguagem de negócio, não timers técnicos */
export function createBusinessWorkflowSla(processRef = {}, partial = {}) {
  const hours = partial.slaHours ?? processRef.slaHours ?? 48;
  return Object.freeze({
    schemaVersion: "mak-business-workflow-sla-v1",
    label: partial.slaLabel ?? `Aprovar em até ${hours} horas úteis`,
    summary: `Prazo de ${hours}h para decisão; após isso o processo é escalado.`,
    durationHours: hours,
    escalation: Object.freeze({
      enabled: partial.escalationEnabled !== false,
      targetRole: partial.escalationRole ?? processRef.escalationRole ?? "supervisor",
      label: partial.escalationLabel ?? "Escalar para supervisor",
      triggerState: "aguardando_aprovacao",
      targetState: "escalado",
    }),
    reminders: Object.freeze([
      Object.freeze({ atPercent: 50, label: "Metade do prazo — lembrete ao responsável" }),
      Object.freeze({ atPercent: 90, label: "Prazo próximo — atenção necessária" }),
    ]),
  });
}

export default createBusinessWorkflowSla;

export function createBusinessWorkflowAuditTrail(partial = {}) {
  return Object.freeze([
    Object.freeze({
      action: partial.action ?? "created",
      actor: partial.actor ?? "intent-resolver",
      at: partial.at ?? new Date().toISOString(),
      detail: partial.detail ?? "Business Workflow asset derived from approved intent.",
    }),
  ]);
}

export default createBusinessWorkflowAuditTrail;

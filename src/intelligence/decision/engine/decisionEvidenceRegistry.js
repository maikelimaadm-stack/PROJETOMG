import { upsertDecisionEvidence } from "./decisionEngineStore.js";
import { appendDecisionAuditEntry } from "./decisionAuditTrail.js";

export function registerDecisionEvidence(input) {
  const evidence = Object.freeze({
    evidenceId: input.evidenceId ?? `dev-${input.tenantId}-${Date.now()}`,
    tenantId: input.tenantId ?? "default",
    decisionId: input.decisionId,
    source: input.source ?? "operational",
    label: input.label ?? "Evidência operacional",
    description: input.description ?? "",
    refId: input.refId ?? null,
    recordedAt: new Date().toISOString(),
    explainable: true,
    aiGenerated: false,
  });
  upsertDecisionEvidence(evidence);
  appendDecisionAuditEntry({
    tenantId: evidence.tenantId,
    action: "evidence_registered",
    entityId: evidence.evidenceId,
    entityType: "evidence",
  });
  return evidence;
}

export default registerDecisionEvidence;

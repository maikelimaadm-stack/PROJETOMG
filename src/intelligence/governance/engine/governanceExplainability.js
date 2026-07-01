export function explainGovernanceDocument(doc) {
  if (!doc) return null;
  return Object.freeze({
    title: doc.title,
    because: "Governança registrada apenas para escopos autorizados — mudanças sensíveis exigem aprovação humana.",
    authorizedTenantCount: doc.authorizedTenantIds?.length ?? 0,
    explainable: true,
    policyChangeRequiresAudit: true,
    crossTenantMixingForbidden: true,
  });
}

export function explainGovernancePolicy(policy) {
  if (!policy) return null;
  return Object.freeze({
    label: policy.label,
    because: `Política ${policy.policyType ?? "ativa"} — ${policy.summary ?? "protege isolamento e visibilidade corporativa."}`,
    explainable: true,
  });
}

export function explainGovernanceDecision(decision) {
  if (!decision) return null;
  return Object.freeze({
    allowed: decision.allowed ?? decision.exposureAllowed ?? false,
    because: decision.reason ?? decision.because ?? "Decisão de governança com trilha de auditoria.",
    explainable: true,
  });
}

export default { explainGovernanceDocument, explainGovernancePolicy, explainGovernanceDecision };

/** Intelligence security contracts — observational, enterprise-owned, no chat for business users */
export const INTELLIGENCE_SECURITY_CONTRACTS = Object.freeze({
  belongsToEnterprise: true,
  belongsToAi: false,
  chatAssistantForbiddenForBusinessUser: true,
  autonomousExecutionForbidden: true,
  autonomousRecommendationForbidden: true,
  crossTenantLeakageForbidden: true,
  technicalSurfaceForbiddenForBusinessUser: true,
  suggestExplainOrganizeOnly: true,
  humanApprovalRequiredForChanges: true,
  bpmnExposureForbidden: false,
});

export function validateIntelligenceSecurity() {
  return Object.freeze({
    ok: INTELLIGENCE_SECURITY_CONTRACTS.autonomousExecutionForbidden === true &&
      INTELLIGENCE_SECURITY_CONTRACTS.chatAssistantForbiddenForBusinessUser === true &&
      INTELLIGENCE_SECURITY_CONTRACTS.belongsToEnterprise === true,
    contracts: INTELLIGENCE_SECURITY_CONTRACTS,
  });
}

export default INTELLIGENCE_SECURITY_CONTRACTS;

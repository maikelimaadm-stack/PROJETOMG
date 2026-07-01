import { GOVERNANCE_OWNERSHIP } from "./platformGovernanceContracts.js";

export function buildGovernanceSeedsRegistry(groupId) {
  return Object.freeze({
    groupId,
    seeds: Object.freeze([
      Object.freeze({ id: "scope-authorization", label: "Autorização de escopo de grupo" }),
      Object.freeze({ id: "tenant-isolation", label: "Isolamento entre tenants" }),
      Object.freeze({ id: "retention-policy", label: "Política de retenção" }),
      Object.freeze({ id: "audit-trail", label: "Trilha de auditoria" }),
      Object.freeze({ id: "compliance-check", label: "Verificação de compliance" }),
    ]),
    ownership: GOVERNANCE_OWNERSHIP,
    explainable: true,
  });
}

export default buildGovernanceSeedsRegistry;

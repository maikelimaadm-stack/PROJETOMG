import { FORTRESS_OWNERSHIP } from "./complianceFortressContracts.js";

export function buildComplianceSeedsRegistry(groupId) {
  return Object.freeze({
    groupId,
    seeds: Object.freeze([
      Object.freeze({ id: "tenant-isolation", label: "Isolamento entre tenants" }),
      Object.freeze({ id: "data-exposure", label: "Controle de exposição" }),
      Object.freeze({ id: "human-approval", label: "Aprovação humana" }),
    ]),
    ownership: FORTRESS_OWNERSHIP,
    explainable: true,
  });
}

export function buildRetentionSeedsRegistry(groupId) {
  return Object.freeze({
    groupId,
    seeds: Object.freeze([
      Object.freeze({ id: "audit-retention", label: "Retenção de auditoria" }),
      Object.freeze({ id: "intelligence-retention", label: "Retenção de inteligência" }),
      Object.freeze({ id: "archive-schedule", label: "Agenda de arquivamento" }),
    ]),
    explainable: true,
  });
}

export function buildAuditSeedsRegistry(groupId) {
  return Object.freeze({
    groupId,
    seeds: Object.freeze([
      Object.freeze({ id: "sensitive-action", label: "Ação sensível auditada" }),
      Object.freeze({ id: "exception-trail", label: "Trilha de exceção" }),
      Object.freeze({ id: "policy-change", label: "Mudança de política" }),
    ]),
    explainable: true,
  });
}

export default { buildComplianceSeedsRegistry, buildRetentionSeedsRegistry, buildAuditSeedsRegistry };

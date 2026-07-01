import { ADOPTION_OWNERSHIP } from "./adoptionEngineContracts.js";

export function assertAdoptionOwnership(tenantId, record) {
  if (record.tenantId !== tenantId) {
    return Object.freeze({ valid: false, reason: "Tenant mismatch — adoption belongs to enterprise" });
  }
  return Object.freeze({
    valid: true,
    ownership: ADOPTION_OWNERSHIP,
    belongsToEnterprise: true,
    belongsToAi: false,
    individualProfilingForbidden: true,
    surveillanceForbidden: true,
  });
}

export default assertAdoptionOwnership;

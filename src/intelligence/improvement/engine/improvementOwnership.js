import { IMPROVEMENT_OWNERSHIP } from "./improvementEngineContracts.js";

export function assertImprovementOwnership(tenantId, record) {
  if (record.tenantId !== tenantId) {
    return Object.freeze({ valid: false, reason: "Tenant mismatch" });
  }
  return Object.freeze({ valid: true, ownership: IMPROVEMENT_OWNERSHIP, belongsToEnterprise: true });
}

export default assertImprovementOwnership;

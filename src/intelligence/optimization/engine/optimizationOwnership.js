import { OPTIMIZATION_OWNERSHIP } from "./optimizationEngineContracts.js";

export function assertOptimizationOwnership(tenantId, record) {
  if (record.tenantId !== tenantId) {
    return Object.freeze({ valid: false, reason: "Tenant mismatch" });
  }
  return Object.freeze({ valid: true, ownership: OPTIMIZATION_OWNERSHIP, belongsToEnterprise: true });
}

export default assertOptimizationOwnership;

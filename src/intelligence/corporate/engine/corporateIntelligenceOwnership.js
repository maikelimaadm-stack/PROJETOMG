import { CORPORATE_OWNERSHIP } from "./corporateIntelligenceContracts.js";

export function assertCorporateOwnership(groupId, record) {
  if (record.groupId !== groupId) {
    return Object.freeze({ valid: false, reason: "Group scope mismatch" });
  }
  return Object.freeze({
    valid: true,
    ownership: CORPORATE_OWNERSHIP,
    belongsToEnterprise: true,
    unauthorizedAggregationForbidden: true,
  });
}

export default assertCorporateOwnership;

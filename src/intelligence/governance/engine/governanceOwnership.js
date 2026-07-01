import { GOVERNANCE_OWNERSHIP } from "./platformGovernanceContracts.js";

export function assertGovernanceOwnership(groupId, record) {
  if (record.groupId !== groupId) {
    return Object.freeze({ valid: false, reason: "Group scope mismatch" });
  }
  return Object.freeze({ valid: true, ownership: GOVERNANCE_OWNERSHIP, belongsToAuthorizedClient: true });
}

export default assertGovernanceOwnership;

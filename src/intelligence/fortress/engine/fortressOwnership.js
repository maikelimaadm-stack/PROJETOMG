import { FORTRESS_OWNERSHIP } from "./complianceFortressContracts.js";

export function assertFortressOwnership(groupId, record) {
  if (record.groupId !== groupId) {
    return Object.freeze({ valid: false, reason: "Group scope mismatch" });
  }
  return Object.freeze({ valid: true, ownership: FORTRESS_OWNERSHIP, belongsToAuthorizedClient: true });
}

export default assertFortressOwnership;

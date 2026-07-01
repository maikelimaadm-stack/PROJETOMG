import { RECOMMENDATION_OWNERSHIP } from "./recommendationEngineContracts.js";

export function assertReplicationOwnership(record) {
  return Object.freeze({
    ...RECOMMENDATION_OWNERSHIP,
    replicationId: record.replicationId,
    tenantId: record.tenantId,
    humanApprovalRequired: true,
    autonomousExecutionForbidden: true,
    verifiedAt: new Date().toISOString(),
  });
}

export default assertReplicationOwnership;

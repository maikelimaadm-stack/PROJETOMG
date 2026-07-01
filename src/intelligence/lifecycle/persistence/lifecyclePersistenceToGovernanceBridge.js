import { retrievePersistentLifecycle } from "./lifecyclePersistenceRetrieval.js";
import { PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";

export function bridgePersistenceToGovernance(groupId, tenantId = "default") {
  const data = retrievePersistentLifecycle(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    approvalCount: data.approvalRequests.length,
    autonomousPolicyForbidden: true,
    ...PERSISTENCE_OWNERSHIP,
    explainable: true,
  });
}

export default bridgePersistenceToGovernance;

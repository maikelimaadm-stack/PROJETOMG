import { retrievePersistentLifecycle } from "./lifecyclePersistenceRetrieval.js";
import { PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";

export function bridgePersistenceToPortfolio(groupId, tenantId = "default") {
  const data = retrievePersistentLifecycle(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    stateCount: data.stateRecords.length,
    unauthorizedAggregationForbidden: true,
    ...PERSISTENCE_OWNERSHIP,
    explainable: true,
  });
}

export default bridgePersistenceToPortfolio;

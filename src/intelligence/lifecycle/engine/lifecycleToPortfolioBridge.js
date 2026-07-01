import { retrieveLatestLifecycle } from "./lifecycleRetrieval.js";
import { LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function bridgeLifecycleToPortfolio(groupId, tenantId = "default") {
  const lifecycle = retrieveLatestLifecycle(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    dataStateCount: lifecycle.dataStates.length,
    readOnly: true,
    unauthorizedAggregationForbidden: true,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export default bridgeLifecycleToPortfolio;

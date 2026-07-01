import { listReplications } from "./recommendationEngineStore.js";

export function getReplicationRegistry(tenantId = "default") {
  const replications = listReplications(tenantId, { limit: 100 });
  return Object.freeze({
    tenantId,
    builtAt: new Date().toISOString(),
    count: replications.length,
    replications: Object.freeze(replications),
    explainable: true,
    humanApprovalRequired: true,
  });
}

export default getReplicationRegistry;

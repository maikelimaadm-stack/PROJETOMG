import { retrieveLatestLifecycle } from "./lifecycleRetrieval.js";
import { LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function bridgeLifecycleToFortress(groupId, tenantId = "default") {
  const lifecycle = retrieveLatestLifecycle(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    archiveCount: lifecycle.archiveLifecycles.length,
    expungeBlocked: lifecycle.expungeExecutions.every((e) => e.expungeAllowed !== true),
    readOnly: true,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export default bridgeLifecycleToFortress;

import { retrieveLatestLifecycle } from "./lifecycleRetrieval.js";
import { LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function bridgeLifecycleToGovernance(groupId, tenantId = "default") {
  const lifecycle = retrieveLatestLifecycle(groupId);
  return Object.freeze({
    groupId,
    tenantId,
    bridgedAt: new Date().toISOString(),
    lifecycleRuleCount: lifecycle.lifecycleRules.length,
    readOnly: true,
    autonomousPolicyForbidden: true,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export default bridgeLifecycleToGovernance;

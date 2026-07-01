import { bridgeLifecycleToGovernance } from "./lifecycleToGovernanceBridge.js";
import { bridgeLifecycleToFortress } from "./lifecycleToFortressBridge.js";
import { bridgeLifecycleToPortfolio } from "./lifecycleToPortfolioBridge.js";
import { LIFECYCLE_OWNERSHIP } from "./dataLifecycleContracts.js";

export function bridgeLifecycleToConsulting(groupId, tenantId = "default") {
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    autonomousAdviceForbidden: true,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export function bridgeLifecycleToDecision(groupId, tenantId = "default") {
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    autonomousDecisionForbidden: true,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export function bridgeLifecycleToIntelligence(groupId, tenantId = "default") {
  return Object.freeze({
    groupId,
    tenantId,
    governance: bridgeLifecycleToGovernance(groupId, tenantId),
    fortress: bridgeLifecycleToFortress(groupId, tenantId),
    portfolio: bridgeLifecycleToPortfolio(groupId, tenantId),
    readOnly: true,
    ...LIFECYCLE_OWNERSHIP,
    explainable: true,
  });
}

export default { bridgeLifecycleToConsulting, bridgeLifecycleToDecision, bridgeLifecycleToIntelligence };

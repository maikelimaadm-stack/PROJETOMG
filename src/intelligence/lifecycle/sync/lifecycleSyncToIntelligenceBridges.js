import { SYNC_OWNERSHIP } from "./lifecycleSyncContracts.js";
import { bridgeSyncToGovernance } from "./lifecycleSyncToGovernanceBridge.js";
import { bridgeSyncToFortress } from "./lifecycleSyncToFortressBridge.js";
import { bridgeSyncToPortfolio } from "./lifecycleSyncToPortfolioBridge.js";

export function bridgeSyncToConsulting(groupId, tenantId = "default") {
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    autonomousAdviceForbidden: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export function bridgeSyncToDecision(groupId, tenantId = "default") {
  return Object.freeze({
    groupId,
    tenantId,
    readOnly: true,
    autonomousDecisionForbidden: true,
    ...SYNC_OWNERSHIP,
    explainable: true,
  });
}

export function bridgeSyncToIntelligence(groupId, tenantId = "default") {
  return Object.freeze({
    groupId,
    tenantId,
    governance: bridgeSyncToGovernance(groupId, tenantId),
    fortress: bridgeSyncToFortress(groupId, tenantId),
    portfolio: bridgeSyncToPortfolio(groupId, tenantId),
    consulting: bridgeSyncToConsulting(groupId, tenantId),
    decision: bridgeSyncToDecision(groupId, tenantId),
    explainable: true,
  });
}

export default { bridgeSyncToConsulting, bridgeSyncToDecision, bridgeSyncToIntelligence };

import { PERSISTENCE_OWNERSHIP } from "./lifecyclePersistenceContracts.js";
import { bridgePersistenceToGovernance } from "./lifecyclePersistenceToGovernanceBridge.js";
import { bridgePersistenceToFortress } from "./lifecyclePersistenceToFortressBridge.js";
import { bridgePersistenceToPortfolio } from "./lifecyclePersistenceToPortfolioBridge.js";

export function bridgePersistenceToConsulting(groupId, tenantId = "default") {
  return Object.freeze({ groupId, tenantId, readOnly: true, autonomousAdviceForbidden: true, ...PERSISTENCE_OWNERSHIP });
}

export function bridgePersistenceToDecision(groupId, tenantId = "default") {
  return Object.freeze({ groupId, tenantId, readOnly: true, autonomousDecisionForbidden: true, ...PERSISTENCE_OWNERSHIP });
}

export function bridgePersistenceToIntelligence(groupId, tenantId = "default") {
  return Object.freeze({
    groupId,
    tenantId,
    governance: bridgePersistenceToGovernance(groupId, tenantId),
    fortress: bridgePersistenceToFortress(groupId, tenantId),
    portfolio: bridgePersistenceToPortfolio(groupId, tenantId),
    readOnly: true,
    explainable: true,
  });
}

export default { bridgePersistenceToConsulting, bridgePersistenceToDecision, bridgePersistenceToIntelligence };
